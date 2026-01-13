import { AppointmentStatus } from './entities/appointment.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch('status/:id')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    console.log('Changing status for appointment:', id, 'to', status);
    return this.appointmentsService.changeStatus(id, status);
  }

  @Patch('cancel/:id')
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.appointmentsService.cancel(id, reason);
  }

  @Patch('reschedule/:id')
  reschedule(@Param('id') id: string, @Body() body: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(
      id,
      body.start_time,
      body.end_time,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('dentist/:dentistId')
  findByDentist(@Param('dentistId') dentistId: string) {
    return this.appointmentsService.findByDentist(dentistId);
  }
}
