import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { randomUUID } from 'crypto';

describe('ApplicationsController', () => {
  let applicationsController: ApplicationsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [ApplicationsService],
    }).compile();

    applicationsController = app.get<ApplicationsController>(
      ApplicationsController,
    );
  });

  describe('CreateApplications', () => {
    it('should return the created applications ID', () => {
      const applicationId = applicationsController.createApplication({
        candidateId: randomUUID(),
      });

      console.log('CC', applicationId);

      expect(applicationId).toBeTruthy();
    });
  });
});
