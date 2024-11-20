import { IsEmail, IsString, Max, Min } from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Min(8)
  @Max(255)
  readonly password: string;
}
