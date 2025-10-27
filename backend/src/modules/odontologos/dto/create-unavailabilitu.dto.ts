import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateDentistUnavailabilityDto {
  @IsNotEmpty()
  @IsUUID()
  dentistId: string;
  @IsNotEmpty()
  unavailable_date: Date;
  @IsString()
  @IsOptional()
  reason?: string;
}
