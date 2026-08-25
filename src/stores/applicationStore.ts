import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Application, PendingApplication } from '../applications/types';

// Intended to replicate some sort of wrapper around external store, ORM or API.
@Injectable()
class ApplicationStore {
  private readonly applications = new Map<Application['id'], Application>();

  get(id: Application['id']) {
    return this.applications.get(id);
  }

  set(application: PendingApplication): Application {
    const created: Application = { id: randomUUID(), ...application };

    this.applications.set(created.id, created);

    return created;
  }

  getUsersApplications(userId: Application['userId']): Application[] {
    return [...this.applications.values()].filter(
      (application) => application.userId === userId,
    );
  }
}

export { ApplicationStore };
