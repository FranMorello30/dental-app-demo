import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateOdontologoDto } from './dto/update-odontologo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Dentist } from './entities/dentist.entity';
//import { Disponibilidad } from './entities/disponibilidad.entity';

//import { DiaLibre } from './entities/dia-libre.entity';

import { CreateDentistDto } from './dto/create-dentist.dto';
import { DentistSchedule } from './entities/dentist-schedules.entity';
import { CreateDentistScheduleDto } from './dto/create-schedule.dto';
import { DentistBreak } from './entities/dentist-breaks.entity';
import { CreateDentistBreakDto } from './dto/create-break.dto';
import { DentistUnavailability } from './entities/dentist-unavailabilities.entity';
import { CreateDentistUnavailabilityDto } from './dto/create-unavailabilitu.dto';

@Injectable()
export class OdontologosService {
  constructor(
    @InjectRepository(Dentist)
    private readonly dentistRepository: Repository<Dentist>,
    @InjectRepository(DentistSchedule)
    private readonly scheduleRepository: Repository<DentistSchedule>,
    @InjectRepository(DentistUnavailability)
    private readonly unavailabilityRepository: Repository<DentistUnavailability>,
    @InjectRepository(DentistBreak)
    private readonly breakRepository: Repository<DentistBreak>,
  ) {}

  async create(createDentistDto: CreateDentistDto): Promise<Dentist> {
    const dentist = this.dentistRepository.create(createDentistDto);
    return await this.dentistRepository.save(dentist);
  }
  async createDentistSchedule(
    dto: CreateDentistScheduleDto[],
  ): Promise<DentistSchedule[]> {
    if (!dto.length) throw new Error('No schedule data provided');
    const dentistId = dto[0].dentistId;
    const dentist = await this.dentistRepository.findOneBy({
      id: dentistId,
    });
    if (!dentist) throw new Error('Dentist not found');

    const schedules = dto.map((scheduleDto) =>
      this.scheduleRepository.create({
        ...scheduleDto,
        dentist,
      }),
    );
    return await this.scheduleRepository.save(schedules);
  }
  async createDentistBreak(dto: CreateDentistBreakDto): Promise<DentistBreak> {
    const schedule = await this.scheduleRepository.findOneBy({
      id: dto.scheduleId,
    });
    if (!schedule) throw new Error('Schedule not found');

    const breakEntity = this.breakRepository.create({
      ...dto,
      schedule,
    });
    return await this.breakRepository.save(breakEntity);
  }

  async findAll() {
    const dentists = await this.dentistRepository.find({
      where: { is_active: true },
      relations: ['schedules', 'schedules.breaks', 'unavailabilities'],
    });
    return { dentists };
  }
  async findOne(id: string) {
    const dentist = await this.dentistRepository.findOne({
      where: { id },
      relations: ['schedules', 'schedules.breaks', 'unavailabilities'],
    });
    return { dentist };
  }
  async findSchedule(id: string) {
    const odontologo = await this.dentistRepository.findOne({
      where: { id },
      relations: ['schedules', 'schedules.breaks'],
      order: { schedules: { day_of_week: 'ASC' } },
    });
    if (!odontologo) throw new NotFoundException('Dentist not found');
    return { schedules: odontologo.schedules };
  }
  async findUnavailability(id: string) {
    const odontologo = await this.dentistRepository.findOne({
      where: { id },
      relations: ['unavailabilities'],
    });
    if (!odontologo) throw new NotFoundException('Dentist not found');
    return { unavailabilities: odontologo.unavailabilities };
  }
  async createDentistUnavailability(
    dto: CreateDentistUnavailabilityDto,
  ): Promise<DentistUnavailability> {
    const dentist = await this.dentistRepository.findOne({
      where: { id: dto.dentistId },
    });
    if (!dentist) throw new NotFoundException('Dentist not found');

    const unavailability = this.unavailabilityRepository.create({
      unavailable_date: dto.unavailable_date,
      reason: dto.reason,
      dentist,
    });
    return await this.unavailabilityRepository.save(unavailability);
  }
  update(id: number, updateOdontologoDto: UpdateOdontologoDto) {
    return `This action updates a #${id} odontologo`;
  }

  remove(id: number) {
    return `This action removes a #${id} odontologo`;
  }
}
