import { UUID } from '../types';

type ApplicationStatus = 'Open' | 'Rejected' | 'Withdrawn';

type Application = {
  userId: UUID;
  id: UUID;
  schemeId: UUID;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

type PendingApplication = Omit<Application, 'id'>;

/**
 * What the client actually receives. Deliberately not the stored shape:
 * `userId` is surfaced as `candidateId` to match the request wording, and
 * internal bookkeeping like `updatedAt` stays internal.
 */
type ApplicationResponse = {
  id: UUID;
  candidateId: UUID;
  schemeId: UUID;
  status: ApplicationStatus;
  submittedAt: string;
};

export {
  type Application,
  type ApplicationStatus,
  type PendingApplication,
  type ApplicationResponse,
};
