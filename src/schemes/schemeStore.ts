import { UUID } from '../types';

type Scheme = {
  id: UUID;
  deadline: Date;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
};

const SchemeStore = new Map<Pick<Scheme, 'id'>, Scheme>();

export { SchemeStore };
