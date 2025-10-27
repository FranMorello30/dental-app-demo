import { IsNotEmpty, IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateDentistBreakDto {
  @IsNotEmpty()
  @IsString()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  end_time: string;

  @IsNotEmpty()
  @IsUUID()
  scheduleId: string;
}
