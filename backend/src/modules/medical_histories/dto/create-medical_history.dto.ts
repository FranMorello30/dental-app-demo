import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateTreatedToothDto {
  @IsNumber()
  tooth_number: number;

  @IsString()
  treatment: string;
}

export class CreateMedicalAttachmentDto {
  @IsString()
  nombre: string;

  @IsString()
  nombreOriginal: string;

  @IsNumber()
  size: number;

  @IsString()
  ruta: string;
}

export class CreateMedicalHistoryDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  dentistId: string;

  // Optional appointment ID if we want to mark it as source
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsString()
  diagnosis: string;

  @IsString()
  treatment: string;

  @IsString()
  medications: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTreatedToothDto)
  teeth?: CreateTreatedToothDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicalAttachmentDto)
  attachments?: CreateMedicalAttachmentDto[];
}
