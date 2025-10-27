import { Type } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateTreatmentProcedureDto } from './create-treatment_procedure.dto';

export class CreateTreatmentPlanDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsDateString()
  start_date: Date;

  @IsNumber()
  @IsOptional()
  progress: number;
  @IsNumber()
  total_cost: number;
  @IsNumber()
  paid_amount: number;
  @IsDateString()
  @IsOptional()
  estimated_end_date?: Date;
  @IsString()
  @IsOptional()
  status?: string;
  @IsString()
  @IsUUID()
  patientId: string;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateTreatmentProcedureDto)
  // @IsOptional()
  // procedures?: CreateTreatmentProcedureDto[];

  @IsArray()
  procedures: CreateTreatmentProcedureDto[];
}
