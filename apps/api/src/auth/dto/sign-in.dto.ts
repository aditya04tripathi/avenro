import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(1024)
  password!: string;
}
