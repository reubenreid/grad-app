import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Every failure the client can see, in one place.
 *
 * `code` is the stable, machine-readable half of the contract: the client
 * branches and localises on it. `message` is the human half, written for a
 * student reading it in a browser, and is safe to render as-is.
 */
const ApplicatonsErrors = {
  SCHEME_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: `We couldn't find that scheme. Check the link you followed, or browse our open schemes.`,
  },
  SCHEME_DEADLINE_PASSED: {
    status: HttpStatus.CONFLICT,
    message: `The deadline for this scheme has passed. You can still apply to our other open schemes.`,
  },
  SCHEME_CLOSED: {
    status: HttpStatus.CONFLICT,
    message: `This scheme is no longer accepting applications. You can still apply to our other open schemes.`,
  },
  ALREADY_APPLIED: {
    status: HttpStatus.CONFLICT,
    message: `You have already applied to this scheme. Withdraw your existing application if you'd like to apply again.`,
  },
  CANDIDATE_NOT_FOUND: {
    // A body field we couldn't resolve, so this is a bad request rather than an
    // auth failure. Once candidateId comes from the session instead, this
    // becomes a 401.
    status: HttpStatus.BAD_REQUEST,
    message: `We couldn't find that candidate account.`,
  },
  INELIGIBLE_USER: {
    status: HttpStatus.FORBIDDEN,
    message: `Only candidate accounts can apply to graduate schemes.`,
  },
  APPLICATION_FAILED: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: `Sorry, we couldn't submit your application. Please try again shortly.`,
  },
} as const;

type ApplicationsErrorCode = keyof typeof ApplicatonsErrors;

/**
 * Emits the same envelope for every failure: { statusCode, code, message }.
 *
 * Note that Nest's `description` option is *not* used, because it is written
 * into the response body rather than the logs.
 */
class ApplicationsError extends HttpException {
  constructor(code: ApplicationsErrorCode, cause?: unknown) {
    const { status, message } = ApplicatonsErrors[code];

    super({ statusCode: status, code, message }, status, { cause });
  }
}

export { ApplicatonsErrors, ApplicationsError, type ApplicationsErrorCode };
