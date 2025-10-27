import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsUUID,
  IsInt,
} from 'class-validator';

export class CreateDentistScheduleDto {
  @IsNotEmpty()
  @IsInt()
  day_of_week: number;

  @IsNotEmpty()
  @IsString()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  end_time: string;

  @IsNotEmpty()
  @IsBoolean()
  is_working_day: boolean;

  @IsNotEmpty()
  @IsUUID()
  dentistId: string;
}
