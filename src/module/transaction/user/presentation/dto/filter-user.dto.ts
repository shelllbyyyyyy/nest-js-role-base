import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterUserDTO {
  @IsString()
  @IsOptional()
  readonly userId?: string;

  @IsString()
  @Min(3)
  @Max(50)
  @IsOptional()
  readonly username?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsBoolean()
  @IsOptional()
  readonly is_verified?: boolean;

  @IsString()
  @IsOptional()
  readonly provider?: string;

  @IsString()
  @IsOptional()
  readonly order_by?: string;

  @IsNumber()
  @IsOptional()
  @Transform((value) => Number(value))
  readonly limit?: number;

  @IsDate()
  @IsString()
  @IsOptional()
  readonly created_at?: Date;

  @IsDate()
  @IsString()
  @IsOptional()
  readonly created_at_start?: Date;

  @IsDate()
  @IsString()
  @IsOptional()
  readonly created_at_end?: Date;

  @IsNumber()
  @Transform((value) => Number(value))
  @IsOptional()
  readonly page?: number;
}
