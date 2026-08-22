import { Injectable } from '@nestjs/common';
import { Application } from './types';
import { ApplicationStore } from './applicationStore';
import { randomUUID } from 'crypto';
import { CreateApplicationDTO } from './applications.dto';

@Injectable()
export class ApplicationsService {
  createApplication({ candidateId }: CreateApplicationDTO) {
    const now = new Date().toISOString();
    const applicationId = randomUUID();

    const application: Application = {
      applicationId,
      createdAt: now,
      status: 'Open',
      updatedAt: now,
      userId: candidateId,
    };

    ApplicationStore.set(applicationId, application);

    return applicationId;
  }
}
