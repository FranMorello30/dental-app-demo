import { IsDateString } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  start_time: Date;

  @IsDateString()
  end_time: Date;
}
