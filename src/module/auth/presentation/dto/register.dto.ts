import { IsEmail, IsString, Max, Min } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @Min(3)
  @Max(50)
  readonly username: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Min(8)
  @Max(255)
  readonly password: string;
}
