import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class CreateHabitDto {
  @IsOptional()
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsBoolean()
  alcohol?: boolean;

  @IsOptional()
  @IsBoolean()
  bruxism?: boolean;

  @IsOptional()
  @IsString()
  flossing?: string;

  @IsOptional()
  @IsString()
  brushingFrequency?: string;
}

export class CreateHistoryDto {
  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsString()
  illnesses?: string;

  @IsOptional()
  @IsString()
  surgeries?: string;
}

export class CreateAttachmentDto {
  @IsString()
  nombre: string;

  @IsString()
  nombreOriginal: string;

  @IsNumber()
  size: number;

  @IsString()
  ruta: string;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHabitDto)
  habits?: CreateHabitDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHistoryDto)
  history?: CreateHistoryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
