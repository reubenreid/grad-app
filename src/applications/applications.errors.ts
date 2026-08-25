export const ApplicatonsErrors = {
  EXPIRED_SCHEME: {
    message: `Sorry, this scheme has expired; please find other open schemes on our site: `,
    description: `The scheme being applied to has expired.`,
  },
  CLOSED_SCHEME: {
    message: `Sorry, this scheme is no longer open; please find other open schemes on our site: `,
    description: `The scheme being applied to is no longer open.`,
  },
  APPLICATION_FAILED: {
    message: `Sorry, applying to this scheme has failed; please try again later`,
    description: `Couldn't set the application data.`,
  },
  ALREADY_APPLIED: {
    message: `Sorry, you have already applied to this scheme; you may withdraw your application to apply again.`,
    description: `Cannot have two open applications to the same scheme.`,
  },
  INELIGIBLE_USER: {
    message: `You cannot apply to graduate schemes.`,
    description: `Non students are unable to apply to schemes.`,
  },
} as const;
