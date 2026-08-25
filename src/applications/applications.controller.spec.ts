import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { randomUUID } from 'crypto';
import { SchemeStore, UserStore, type User } from '../stores';
import { Scheme } from '../stores';
import { UUID } from '../types';
import { CreateApplicationDTO } from './applications.dto';

type ApplicationTestSpec = {
  title: string;
  user: User;
  scheme: Scheme;
  body: (spec: ApplicationTestSpec) => CreateApplicationDTO;
  condition: (ctx: {
    spec: ApplicationTestSpec;
    result?: UUID;
    error?: {
      message: string;
    };
  }) => void;
};

const YEAR_MS = 3.154e10;

const candidate: User = {
  id: randomUUID(),
  type: 'Candidate',
};

const manager: User = {
  id: randomUUID(),
  type: 'Manager',
};

const openAndInDateScheme: Scheme = {
  deadline: new Date(Date.now() + YEAR_MS),
  id: randomUUID(),
  isOpen: true,
};

const openAndExpiredScheme: Scheme = {
  deadline: new Date(Date.now() - YEAR_MS),
  id: randomUUID(),
  isOpen: true,
};

const closedAndInDateScheme: Scheme = {
  deadline: new Date(Date.now() + YEAR_MS),
  id: randomUUID(),
  isOpen: false,
};

// If you wanted tests for mis
const matchingBody = (spec: ApplicationTestSpec): CreateApplicationDTO => {
  return {
    candidateId: spec.user?.id,
    schemeId: spec.scheme?.id,
  };
};

describe('ApplicationsController', () => {
  let applicationsController: ApplicationsController;

  const testSpecs: ApplicationTestSpec[] = [
    {
      title: 'Success: should return the created application ID.',
      user: candidate,
      scheme: openAndInDateScheme,
      body: matchingBody,
      condition(ctx) {
        expect(ctx.result).toBeTruthy();
      },
    },
    {
      title: 'Fail: throws an error when applying to an expired scheme.',
      user: candidate,
      scheme: openAndExpiredScheme,
      body: matchingBody,
      condition(ctx) {
        expect(ctx.error?.message).toEqual(
          ApplicationsService.Errors.EXPIRED_SCHEME.message,
        );
      },
    },
    {
      title: 'Fail: throws an error when applying to a closed scheme.',
      user: candidate,
      scheme: closedAndInDateScheme,
      body: matchingBody,
      condition(ctx) {
        expect(ctx.error?.message).toEqual(
          ApplicationsService.Errors.CLOSED_SCHEME.message,
        );
      },
    },
    {
      title:
        'Fail: throws an error when applying to an already applied to scheme.',
      user: candidate,
      scheme: openAndInDateScheme,
      body: matchingBody,
      condition(ctx) {
        expect(ctx.error).toBeTruthy();
      },
    },
    {
      title: 'Fail: throws an error when a non candidate applies to a scheme.',
      user: manager,
      scheme: openAndInDateScheme,
      body: matchingBody,
      condition(ctx) {
        expect(ctx.error).toBeTruthy();
      },
    },
  ];

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
    testSpecs.forEach((spec) => {
      it(spec.title, () => {
        UserStore.set(spec.user.id, spec.user);
        SchemeStore.set(spec.scheme.id, spec.scheme);

        const body =
          typeof spec.body === 'function' ? spec.body(spec) : spec.body;

        let result: UUID | undefined;
        let error: { message: string } | undefined;
        try {
          result = applicationsController.createApplication(body);
        } catch (e: any) {
          error = e as { message: string };
        }

        spec.condition({ spec, result, error });
      });
    });
  });
});
