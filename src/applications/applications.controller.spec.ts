import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { randomUUID } from 'crypto';
import { AppModule } from '../app.module';
import {
  ApplicationStore,
  SchemeStore,
  UserStore,
  type Scheme,
  type User,
} from '../stores';
import { UUID } from '../types';

const YEAR_MS = 3.154e10;

const candidate: User = { id: randomUUID(), type: 'Candidate' };
const manager: User = { id: randomUUID(), type: 'Manager' };

const openScheme: Scheme = {
  id: randomUUID(),
  deadline: new Date(Date.now() + YEAR_MS),
  isOpen: true,
};

const expiredScheme: Scheme = {
  id: randomUUID(),
  deadline: new Date(Date.now() - YEAR_MS),
  isOpen: true,
};

const closedScheme: Scheme = {
  id: randomUUID(),
  deadline: new Date(Date.now() + YEAR_MS),
  isOpen: false,
};

type Stores = {
  applications: ApplicationStore;
  schemes: SchemeStore;
  users: UserStore;
};

/** supertest types `.body` as `any`; this keeps the assertions honest. */
type ResponseBody = Record<string, unknown>;

const anyString = expect.any(String) as unknown;

type ApplicationTestSpec = {
  title: string;
  /** Anything this case needs on top of the baseline fixtures. */
  seed?: (stores: Stores) => void;
  body: Record<string, unknown>;
  expected: { status: number; code?: string };
  assert?: (body: ResponseBody, response: request.Response) => void;
};

const applicationFor = (
  userId: UUID,
  schemeId: UUID,
  status: 'Open' | 'Withdrawn',
) => {
  const now = new Date().toISOString();

  return { userId, schemeId, status, createdAt: now, updatedAt: now } as const;
};

describe('POST /applications', () => {
  let app: INestApplication;
  let stores: Stores;

  const testSpecs: ApplicationTestSpec[] = [
    {
      title: 'Success: 201s with the created application.',
      body: { candidateId: candidate.id, schemeId: openScheme.id },
      expected: { status: 201 },
      assert(body, response) {
        expect(body).toEqual({
          id: anyString,
          candidateId: candidate.id,
          schemeId: openScheme.id,
          status: 'Open',
          submittedAt: anyString,
        });
        expect(response.headers.location).toEqual(
          `/applications/${String(body.id)}`,
        );
      },
    },
    {
      title: 'Fail: 409s when the scheme deadline has passed.',
      body: { candidateId: candidate.id, schemeId: expiredScheme.id },
      expected: { status: 409, code: 'SCHEME_DEADLINE_PASSED' },
    },
    {
      title: 'Fail: 409s when the scheme is closed.',
      body: { candidateId: candidate.id, schemeId: closedScheme.id },
      expected: { status: 409, code: 'SCHEME_CLOSED' },
    },
    {
      title: 'Fail: 409s when the candidate already has an open application.',
      seed: ({ applications }) =>
        void applications.set(
          applicationFor(candidate.id, openScheme.id, 'Open'),
        ),
      body: { candidateId: candidate.id, schemeId: openScheme.id },
      expected: { status: 409, code: 'ALREADY_APPLIED' },
    },
    {
      title:
        'Success: 201s when the candidate’s only prior application was withdrawn.',
      seed: ({ applications }) =>
        void applications.set(
          applicationFor(candidate.id, openScheme.id, 'Withdrawn'),
        ),
      body: { candidateId: candidate.id, schemeId: openScheme.id },
      expected: { status: 201 },
    },
    {
      title: 'Fail: 404s when the scheme does not exist.',
      body: { candidateId: candidate.id, schemeId: randomUUID() },
      expected: { status: 404, code: 'SCHEME_NOT_FOUND' },
    },
    {
      title: 'Fail: 403s when a non-candidate applies.',
      body: { candidateId: manager.id, schemeId: openScheme.id },
      expected: { status: 403, code: 'INELIGIBLE_USER' },
    },
    {
      title: 'Fail: 400s when the candidate does not exist.',
      body: { candidateId: randomUUID(), schemeId: openScheme.id },
      expected: { status: 400, code: 'CANDIDATE_NOT_FOUND' },
    },
    {
      title: 'Fail: 400s when required fields are missing.',
      body: {},
      expected: { status: 400 },
    },
    {
      title: 'Success: 201s when the body carries unknown fields.',
      body: {
        candidateId: candidate.id,
        schemeId: openScheme.id,
        status: 'Accepted',
      },
      expected: { status: 201 },
    },
  ];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Stores are providers, so each test gets its own empty instances and no
    // case depends on another having run first.
    stores = {
      applications: app.get(ApplicationStore),
      schemes: app.get(SchemeStore),
      users: app.get(UserStore),
    };

    [candidate, manager].forEach((user) => stores.users.set(user));
    [openScheme, expiredScheme, closedScheme].forEach((scheme) =>
      stores.schemes.set(scheme),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  testSpecs.forEach((spec) => {
    it(spec.title, async () => {
      spec.seed?.(stores);

      const response = await request(app.getHttpServer() as Server)
        .post('/applications')
        .send(spec.body);

      const body = response.body as ResponseBody;

      expect(response.status).toEqual(spec.expected.status);

      if (spec.expected.code) {
        expect(body).toMatchObject({
          statusCode: spec.expected.status,
          code: spec.expected.code,
          message: anyString,
        });
      }

      spec.assert?.(body, response);
    });
  });
});
