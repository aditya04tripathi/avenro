import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  emailVerified!: boolean;
}

export class RegistrationAcceptedDto {
  @ApiProperty()
  accepted!: boolean;
}

export class AuthSessionDto {
  @ApiProperty({
    description: 'Opaque session handle used only to revoke this session.',
  })
  id!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: Date;

  @ApiProperty({ format: 'date-time' })
  lastActiveAt!: Date;

  @ApiProperty()
  current!: boolean;
}
