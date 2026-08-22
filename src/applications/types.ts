import { UUID } from '../types';

type ApplicationStatus = 'Open' | 'Rejected' | 'Withdrawn';

type Application = {
  userId: UUID;
  applicationId: UUID;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export { type Application };
