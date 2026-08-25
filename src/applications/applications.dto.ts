import { IsUUID } from 'class-validator';
import type { UUID } from '../types';

export class CreateApplicationDTO {
  @IsUUID(undefined, { message: `candidateId must be a valid ID.` })
  readonly candidateId!: UUID;

  @IsUUID(undefined, { message: `schemeId must be a valid ID.` })
  readonly schemeId!: UUID;
}
