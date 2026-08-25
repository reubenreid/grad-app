import { Injectable } from '@nestjs/common';
import { Application, ApplicationResponse, PendingApplication } from './types';
import { ApplicationStore, SchemeStore, UserStore } from '../stores';
import { CreateApplicationDTO } from './applications.dto';
import { ApplicationsError } from './applications.errors';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationStore: ApplicationStore,
    private readonly schemeStore: SchemeStore,
    private readonly userStore: UserStore,
  ) {}

  private apply(application: PendingApplication): Application {
    try {
      return this.applicationStore.set(application);
    } catch {
      throw new ApplicationsError('APPLICATION_FAILED');
    }
  }

  private hasUserAlreadyApplied({ userId, schemeId }: PendingApplication) {
    return this.applicationStore
      .getUsersApplications(userId)
      .some(
        (application) =>
          application.schemeId === schemeId &&
          application.status !== 'Withdrawn',
      );
  }

  private checkSchemeEligible({ schemeId }: PendingApplication) {
    const scheme = this.schemeStore.get(schemeId);

    // Checked separately from the rules below so an unknown scheme reads as
    // "we couldn't find that", rather than borrowing whichever rule a missing
    // record happens to trip first.
    if (!scheme) {
      throw new ApplicationsError('SCHEME_NOT_FOUND');
    }

    if (Date.now() > scheme.deadline.valueOf()) {
      throw new ApplicationsError('SCHEME_DEADLINE_PASSED');
    }

    if (!scheme.isOpen) {
      throw new ApplicationsError('SCHEME_CLOSED');
    }
  }

  private checkUserEligible(application: PendingApplication) {
    const user = this.userStore.get(application.userId);

    if (!user) {
      throw new ApplicationsError('CANDIDATE_NOT_FOUND');
    }

    if (user.type !== 'Candidate') {
      throw new ApplicationsError('INELIGIBLE_USER');
    }

    if (this.hasUserAlreadyApplied(application)) {
      throw new ApplicationsError('ALREADY_APPLIED');
    }
  }

  private toResponse(application: Application): ApplicationResponse {
    return {
      id: application.id,
      candidateId: application.userId,
      schemeId: application.schemeId,
      status: application.status,
      submittedAt: application.createdAt,
    };
  }

  createApplication({
    candidateId,
    schemeId,
  }: CreateApplicationDTO): ApplicationResponse {
    const now = new Date().toISOString();

    const application: PendingApplication = {
      createdAt: now,
      status: 'Open',
      updatedAt: now,
      userId: candidateId,
      schemeId,
    };

    this.checkSchemeEligible(application);
    this.checkUserEligible(application);

    return this.toResponse(this.apply(application));
  }
}
