import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsDateString()
  date_of_birth: Date;

  @IsOptional()
  @IsDateString()
  last_appointment?: Date;

  @IsOptional()
  @IsDateString()
  next_appointment?: Date;

  @IsString()
  insurance: string;

  @IsString()
  insurance_id: string;

  @IsString()
  dni: string;

  @IsNumber()
  balance: number;

  @IsString()
  notes: string;

  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;
}
