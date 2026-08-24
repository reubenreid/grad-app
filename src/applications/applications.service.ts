import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PendingApplication } from './types';
import { ApplicationStore } from '../stores/applicationStore';
import { CreateApplicationDTO } from './applications.dto';
import { SchemeStore, UserStore } from '../stores';
import { UUID } from '../types';

@Injectable()
export class ApplicationsService {
  apply(application: PendingApplication): UUID {
    if (SchemeStore.schemeIsExpired(application.schemeId)) {
      throw new BadRequestException(
        `Sorry, this scheme has expired; please find other open schemes on our site: `,
        {
          description: `The scheme being applied to has expired.`,
        },
      );
    }

    if (!SchemeStore.schemeIsOpen(application.schemeId)) {
      throw new BadRequestException(
        `Sorry, this scheme is no longer open; please find other open schemes on our site: `,
        {
          description: `The scheme being applied to is no longer open.`,
        },
      );
    }

    try {
      return ApplicationStore.set(application);
    } catch (e) {
      throw new InternalServerErrorException(
        `Sorry, applying to this scheme has failed; please try again later`,
        {
          cause: e,
          description: `Couldn't set the application data.`,
        },
      );
    }
  }

  checkUserCanApply(candidateId: UUID) {
    const user = UserStore.get(candidateId);

    if (!user) {
      // In application this would be a weird state, might have to assume something is garbled
      // around reading the userId from the session context, cookie etc. Maybe treat this like an unauthed state?
      throw new UnauthorizedException(
        `You aren't authorised for this request.`,
        {
          description: `User couldn't be fetched from the user store; assuming unauthorised.`,
        },
      );
    }

    if (user.type !== 'Candidate') {
      throw new ForbiddenException(`You cannot apply to graduate schemes.`, {
        description: `Non students are unable to apply to schemes.`,
      });
    }
  }

  createApplication({ candidateId, schemeId }: CreateApplicationDTO): UUID {
    const now = new Date().toISOString();

    const application: PendingApplication = {
      createdAt: now,
      status: 'Open',
      updatedAt: now,
      userId: candidateId,
      schemeId,
    };

    this.checkUserCanApply(candidateId);

    return this.apply(application);
  }
}
