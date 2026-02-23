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
import { TreatmentProcedure } from '../treatment_plans/entities/treatment_procedure.entity';
import { TreatmentPlan } from '../treatment_plans/entities/treatment_plan.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Dentist)
    private readonly dentistRepository: Repository<Dentist>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(TreatmentProcedure)
    private readonly procedureRepository: Repository<TreatmentProcedure>,
    @InjectRepository(TreatmentPlan)
    private readonly planRepository: Repository<TreatmentPlan>,
    private readonly socketService: SocketService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<{ message: string }> {
    const { procedureId, ...appointmentDto } = createAppointmentDto;

    const dentist = await this.dentistRepository.findOne({
      where: { id: appointmentDto.dentistId },
    });
    if (!dentist) throw new NotFoundException('Dentist not found');
    const patient = await this.patientRepository.findOne({
      where: { id: appointmentDto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    let procedure: TreatmentProcedure | null = null;
    if (procedureId) {
      procedure = await this.procedureRepository.findOne({
        where: { id: procedureId },
        relations: ['plan', 'plan.patient'],
      });

      if (!procedure) {
        throw new NotFoundException('Treatment procedure not found');
      }

      if (procedure.plan?.patient?.id !== patient.id) {
        throw new BadRequestException(
          'Procedure does not belong to the selected patient',
        );
      }
    }

    const status = appointmentDto.status || AppointmentStatus.UNCONFIRMED;
    this.ensureFinishedStatusHasProcedure(status, !!procedure);

    const appointment = this.appointmentRepository.create({
      ...appointmentDto,
      dentist,
      patient,
      procedure: procedure || undefined,
      treatment:
        appointmentDto.treatment || procedure?.name || 'Sin tratamiento',
      status,
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
        'procedure',
        'procedure.plan',
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
        'procedure',
        'procedure.plan',
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

    const nextStatus = updateAppointmentDto.status ?? appointment.status;
    this.ensureFinishedStatusHasProcedure(nextStatus, !!appointment.procedure);

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

    this.ensureFinishedStatusHasProcedure(status, !!appointment.procedure);

    if (status === AppointmentStatus.FINISHED && appointment.procedure?.id) {
      await this.markProcedureCompleted(appointment.procedure.id);
    }

    appointment.status = status;
    const updatedAppointment =
      await this.appointmentRepository.save(appointment);
    this.socketService.emitEvent(
      'change-status-appointment',
      updatedAppointment,
    );
    return { message: 'Appointment status updated successfully' };
  }

  private async markProcedureCompleted(procedureId: string): Promise<void> {
    const procedure = await this.procedureRepository.findOne({
      where: { id: procedureId },
      relations: ['plan'],
    });

    if (!procedure) {
      return;
    }

    procedure.status = 'completado';
    procedure.completed_date = new Date();
    await this.procedureRepository.save(procedure);

    if (procedure.plan?.id) {
      await this.syncPlanProgress(procedure.plan.id);
    }
  }

  private async syncPlanProgress(planId: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) {
      return;
    }

    const totalProcedures = await this.procedureRepository.count({
      where: { plan: { id: planId } },
    });

    const completedProcedures = await this.procedureRepository
      .createQueryBuilder('procedure')
      .where('procedure.planId = :planId', { planId })
      .andWhere('LOWER(procedure.status) = :completedStatus', {
        completedStatus: 'completado',
      })
      .getCount();

    const progress =
      totalProcedures === 0
        ? 0
        : Math.round((completedProcedures / totalProcedures) * 100);

    plan.progress = progress;
    if (completedProcedures === totalProcedures && totalProcedures > 0) {
      plan.status = 'finalizado';
      if (!plan.estimated_end_date) {
        plan.estimated_end_date = new Date();
      }
    }

    await this.planRepository.save(plan);
  }

  private ensureFinishedStatusHasProcedure(
    status: AppointmentStatus,
    hasProcedure: boolean,
  ): void {
    if (status === AppointmentStatus.FINISHED && !hasProcedure) {
      throw new BadRequestException(
        'Cannot set appointment as Finalizada without linked treatment procedure',
      );
    }
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
    const absenceThreshold = new Date(now.getTime() - 20 * 60 * 1000);

    const appointmentsMarkedAbsent = await this.appointmentRepository.find({
      where: {
        status: AppointmentStatus.CONFIRMED,
        start_time: LessThanOrEqual(absenceThreshold),
        is_deleted: false,
      },
    });

    if (appointmentsMarkedAbsent.length > 0) {
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
