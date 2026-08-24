import { UUID } from '../types';

type ApplicationStatus = 'Open' | 'Rejected' | 'Withdrawn';

type Application = {
  userId: UUID;
  id: UUID;
  schemeId: UUID;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  withdrawn: boolean;
};

type PendingApplication = Omit<Application, 'id' | 'withdrawn'>;

export { type Application, type PendingApplication };
