import { Injectable } from '@nestjs/common';
import { UUID } from '../types';

const UserTypes = ['Candidate', 'Manager'] as const;

type User = {
  id: UUID;
  type: (typeof UserTypes)[number];
};

// Intended to replicate some sort of wrapper around external store, ORM or API.
@Injectable()
class UserStore {
  private readonly users = new Map<User['id'], User>();

  get(id: User['id']) {
    return this.users.get(id);
  }

  set(user: User) {
    this.users.set(user.id, user);
  }
}

export { UserStore, type UserTypes, type User };
