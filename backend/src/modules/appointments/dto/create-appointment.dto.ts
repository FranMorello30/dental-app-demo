import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  start_time: Date;

  @IsDateString()
  end_time: Date;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsString()
  treatment: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;

  @IsString()
  dentistId: string;

  @IsString()
  patientId: string;
}
