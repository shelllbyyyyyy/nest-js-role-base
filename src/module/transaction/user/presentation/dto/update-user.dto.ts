import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @Min(8)
  @Max(255)
  @IsOptional()
  readonly current_password?: string;

  @IsString()
  @Min(3)
  @Max(50)
  @IsOptional()
  readonly username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @Min(8)
  @Max(255)
  @IsOptional()
  readonly password?: string;

  @IsBoolean()
  @IsOptional()
  readonly is_verified?: boolean;

  @IsString()
  @IsOptional()
  readonly role?: string;

  @IsString()
  @IsOptional()
  readonly provider?: string;
}
