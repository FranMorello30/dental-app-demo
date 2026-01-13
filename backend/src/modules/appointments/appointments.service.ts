import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Dentist } from 'src/modules/odontologos/entities/dentist.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Dentist)
    private readonly dentistRepository: Repository<Dentist>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<{ message: string }> {
    console.log('Creating appointment with DTO:', createAppointmentDto);

    const dentist = await this.dentistRepository.findOne({
      where: { id: createAppointmentDto.dentistId },
    });
    if (!dentist) throw new NotFoundException('Dentist not found');
    const patient = await this.patientRepository.findOne({
      where: { id: createAppointmentDto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      dentist,
      patient,
      status: createAppointmentDto.status || AppointmentStatus.UNCONFIRMED,
    });
    await this.appointmentRepository.save(appointment);

    return { message: 'Appointment created successfully' };
  }

  async findAll(): Promise<{ appointments: Appointment[] }> {
    const appointments = await this.appointmentRepository.find({
      where: { is_deleted: false },
      relations: ['dentist', 'patient'],
    });

    // appointments.forEach((appointment) => {
    //   // Convert date fields to ISO strings
    //   appointment.start_time = new Date(appointment.start_time);
    //   appointment.end_time = new Date(appointment.end_time);
    // });

    return { appointments };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['dentist', 'patient'],
    });
    if (!appointment)
      throw new NotFoundException(`Appointment #${id} not found`);
    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async changeStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<{ message: string }> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    await this.appointmentRepository.save(appointment);
    return { message: 'Appointment status updated successfully' };
  }

  async cancel(id: string, reason: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELED;
    appointment.cancellation_reason = reason;
    return this.appointmentRepository.save(appointment);
  }

  async reschedule(
    id: string,
    start_time: Date,
    end_time: Date,
  ): Promise<{ message: string }> {
    const appointment = await this.findOne(id);

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start or end time');
    }

    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException('End time must be after start time');
    }

    appointment.start_time = start;
    appointment.end_time = end;
    await this.appointmentRepository.save(appointment);

    return { message: 'Appointment rescheduled successfully' };
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    appointment.is_deleted = true;
    await this.appointmentRepository.save(appointment);
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        dentist: { id: dentistId },
        is_deleted: false,
      },
      relations: ['dentist', 'patient'],
    });
  }
}
