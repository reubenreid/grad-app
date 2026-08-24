import { UUID } from '../types';

type Scheme = {
  id: UUID;
  deadline: Date;
  isOpen: boolean;
};

const schemes = new Map<Scheme['id'], Scheme>();

// Intended to replicate some sort of wrapper around external store, ORM or API.
const SchemeStore = {
  get(id: Parameters<typeof schemes.get>[0]) {
    return schemes.get(id);
  },
  set(...args: Parameters<typeof schemes.set>) {
    schemes.set(...args);
  },
  schemeIsOpen(schemeId: Scheme['id']): boolean {
    return this.get(schemeId)?.isOpen ?? false;
  },
  schemeIsExpired(schemeId: Scheme['id']): boolean {
    const schemeDeadline = this.get(schemeId)?.deadline;
    // Really you'd get this off the request to account for timezones.
    const now = Date.now();
    const isExpired = now > (schemeDeadline?.valueOf() || 0);

    return isExpired;
  },
};

export { SchemeStore, type Scheme };
