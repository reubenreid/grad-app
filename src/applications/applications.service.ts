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
import { ApplicatonsErrors } from './applications.errors';

@Injectable()
export class ApplicationsService {
  static Errors = ApplicatonsErrors;

  private apply(application: PendingApplication): UUID {
    try {
      return ApplicationStore.set(application);
    } catch (e) {
      throw new InternalServerErrorException(
        ApplicationsService.Errors.APPLICATION_FAILED.message,
        {
          cause: e,
          description:
            ApplicationsService.Errors.APPLICATION_FAILED.description,
        },
      );
    }
  }

  private hasUserAlreadyApplied({ userId, schemeId }: PendingApplication) {
    const usersApplications = ApplicationStore.getUsersApplications(userId);

    return usersApplications.some(
      ([_, application]) =>
        application.schemeId === schemeId && application.userId === userId,
    );
  }

  private checkSchemeEligible(application: PendingApplication) {
    if (SchemeStore.schemeIsExpired(application.schemeId)) {
      throw new BadRequestException(
        ApplicationsService.Errors.EXPIRED_SCHEME.message,
        {
          description: ApplicationsService.Errors.EXPIRED_SCHEME.description,
        },
      );
    }

    if (!SchemeStore.schemeIsOpen(application.schemeId)) {
      throw new BadRequestException(
        ApplicationsService.Errors.CLOSED_SCHEME.message,
        {
          description: ApplicationsService.Errors.CLOSED_SCHEME.description,
        },
      );
    }
  }

  private checkUserEligible(application: PendingApplication) {
    const user = UserStore.get(application.userId);

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

    if (this.hasUserAlreadyApplied(application)) {
      throw new BadRequestException(
        ApplicationsService.Errors.ALREADY_APPLIED.message,
        {
          description: ApplicationsService.Errors.ALREADY_APPLIED.description,
        },
      );
    }

    if (user.type !== 'Candidate') {
      throw new ForbiddenException(
        ApplicationsService.Errors.INELIGIBLE_USER.message,
        {
          description: ApplicationsService.Errors.INELIGIBLE_USER.description,
        },
      );
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

    this.checkUserEligible(application);
    this.checkSchemeEligible(application);

    return this.apply(application);
  }
}
