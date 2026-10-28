import { Matches } from 'class-validator';

export class RevokeSessionParamsDto {
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  id!: string;
}
