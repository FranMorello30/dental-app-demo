import { Dentist } from 'src/modules/odontologos/entities/dentist.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AppointmentStatus {
  UNCONFIRMED = 'Sin confirmar',
  CONFIRMED = 'Confirmada',
  IN_CONSULTATION = 'En consulta',
  CANCELED = 'Cancelada',
  FINISHED = 'Finalizada',
  PENDING_FINISHED = 'Finalizada (Pendiente)',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'datetime' })
  start_time: Date;

  @Column({ type: 'datetime' })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.UNCONFIRMED,
  })
  status: AppointmentStatus;

  @Column({ type: 'varchar', nullable: false })
  treatment: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @ManyToOne(() => Dentist, (dentist) => dentist.id, { cascade: true })
  dentist: Dentist;

  @ManyToOne(() => Patient, (patient) => patient.id, { cascade: true })
  patient: Patient;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updated_at: Date;

  @Column('bool', {
    default: false,
  })
  is_deleted: boolean;
}
