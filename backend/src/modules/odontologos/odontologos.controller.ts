import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OdontologosService } from './odontologos.service';

import { UpdateOdontologoDto } from './dto/update-odontologo.dto';

import { CreateDentistDto } from './dto/create-dentist.dto';
import { CreateDentistScheduleDto } from './dto/create-schedule.dto';
import { CreateDentistBreakDto } from './dto/create-break.dto';
import { CreateDentistUnavailabilityDto } from './dto/create-unavailabilitu.dto';

@Controller('odontologos')
export class OdontologosController {
  constructor(private readonly odontologosService: OdontologosService) {}

  @Post()
  create(@Body() body: CreateDentistDto) {
    return this.odontologosService.create(body);
  }

  @Post('schedule')
  createDentistSchedule(@Body() body: CreateDentistScheduleDto[]) {
    return this.odontologosService.createDentistSchedule(body);
  }

  @Post('schedule-break')
  createDentistBreak(@Body() body: CreateDentistBreakDto) {
    return this.odontologosService.createDentistBreak(body);
  }

  @Post('unavailability')
  createDentistUnavailability(@Body() body: CreateDentistUnavailabilityDto) {
    return this.odontologosService.createDentistUnavailability(body);
  }

  @Get()
  findAll() {
    return this.odontologosService.findAll();
  }

  @Get('schedule/:id')
  findSchedule(@Param('id') id: string) {
    return this.odontologosService.findSchedule(id);
  }
  @Get('unavailability/:id')
  findUnavailability(@Param('id') id: string) {
    return this.odontologosService.findUnavailability(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.odontologosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOdontologoDto: UpdateOdontologoDto,
  ) {
    return this.odontologosService.update(+id, updateOdontologoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.odontologosService.remove(+id);
  }
}
