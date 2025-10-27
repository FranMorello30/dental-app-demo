import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
