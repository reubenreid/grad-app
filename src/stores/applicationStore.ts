import { randomUUID } from 'crypto';
import { Application, PendingApplication } from '../applications/types';

const applications = new Map<Application['id'], Application>();

const ApplicationStore = {
  get(id: Parameters<typeof applications.get>[0]) {
    return applications.get(id);
  },
  set(args: PendingApplication) {
    const id = randomUUID();

    applications.set(id, {
      id,
      withdrawn: false,
      ...args,
    });

    // Assume this just never fails somehow, rather than implement faux DB error handling.
    return applications.get(id)!.id;
  },
};

export { ApplicationStore };
