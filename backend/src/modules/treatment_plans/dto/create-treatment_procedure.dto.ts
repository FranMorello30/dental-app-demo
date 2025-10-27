import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateTreatmentProcedureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  cost: number;

  @IsDateString()
  scheduled_date: Date;
}
