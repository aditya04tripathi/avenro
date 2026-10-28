import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailAddressDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class EmailTokenDto {
  @IsString()
  @MinLength(32)
  @MaxLength(512)
  token!: string;
}

export class PasswordResetDto extends EmailTokenDto {
  @IsString()
  @MinLength(12)
  @MaxLength(1024)
  password!: string;
}
