import { UUID } from '../types';

const UserTypes = ['Candidate', 'Manager'] as const;

type User = {
  id: UUID;
  type: (typeof UserTypes)[number];
};

const UserStore = new Map<User['id'], User>();

export { UserStore, type UserTypes, type User };
