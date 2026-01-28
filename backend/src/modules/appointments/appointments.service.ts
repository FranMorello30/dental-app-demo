import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Dentist } from 'src/modules/odontologos/entities/dentist.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { SocketService } from 'src/socket/socket-ws.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Dentist)
    private readonly dentistRepository: Repository<Dentist>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly socketService: SocketService,
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
    const savedAppointment = await this.appointmentRepository.save(appointment);
    this.socketService.emitEvent('change-status-appointment', savedAppointment);

    return { message: 'Appointment created successfully' };
  }

  async findAll(): Promise<{ appointments: Appointment[] }> {
    const appointments = await this.appointmentRepository.find({
      where: { is_deleted: false },
      relations: [
        'dentist',
        'patient',
        'patient.habit',
        'patient.medical_alerts',
        'patient.attachments',
      ],
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
      relations: [
        'dentist',
        'patient',
        'patient.habit',
        'patient.medical_alerts',
        'patient.attachments',
        'medical_histories',
        'medical_histories.treated_teeth',
        'medical_histories.attachments',
      ],
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
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.socketService.emitEvent(
      'change-status-appointment',
      updatedAppointment,
    );
    return updatedAppointment;
  }

  async changeStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<{ message: string }> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.socketService.emitEvent(
      'change-status-appointment',
      updatedAppointment,
    );
    return { message: 'Appointment status updated successfully' };
  }

  async cancel(id: string, reason: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELED;
    appointment.cancellation_reason = reason;
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.socketService.emitEvent(
      'change-status-appointment',
      updatedAppointment,
    );
    return updatedAppointment;
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
      relations: [
        'dentist',
        'patient',
        'medical_histories',
        'medical_histories.treated_teeth',
        'medical_histories.attachments',
      ],
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkScheduledAppointments() {
    const now = new Date();
    const absenceThreshold = new Date(now.getTime() - 20 * 60 * 1000); // 20 minutes after scheduled start

    // Mark confirmed appointments as absent if they have not been checked in within 20 minutes of the start time
    const appointmentsMarkedAbsent = await this.appointmentRepository.find({
      where: {
        status: AppointmentStatus.CONFIRMED,
        start_time: LessThanOrEqual(absenceThreshold),
        is_deleted: false,
      },
    });

    if (appointmentsMarkedAbsent.length > 0) {
      console.log(
        `[Cron] Found ${appointmentsMarkedAbsent.length} appointments still CONFIRMED 20+ minutes after start. Updating to AUSENTE.`,
      );

      for (const appointment of appointmentsMarkedAbsent) {
        appointment.status = AppointmentStatus.AUSENTE;
      }

      await this.appointmentRepository.save(appointmentsMarkedAbsent);
      this.socketService.emitEvent(
        'change-status-appointment',
        appointmentsMarkedAbsent,
      );
    }
  }
}
