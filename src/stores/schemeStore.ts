import { Injectable } from '@nestjs/common';
import { UUID } from '../types';

type Scheme = {
  id: UUID;
  deadline: Date;
  isOpen: boolean;
};

// Intended to replicate some sort of wrapper around external store, ORM or API.
@Injectable()
class SchemeStore {
  private readonly schemes = new Map<Scheme['id'], Scheme>();

  get(id: Scheme['id']) {
    return this.schemes.get(id);
  }

  set(scheme: Scheme) {
    this.schemes.set(scheme.id, scheme);
  }
}

export { SchemeStore, type Scheme };
