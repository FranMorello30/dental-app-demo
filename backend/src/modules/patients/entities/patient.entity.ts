import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Habit } from './habit.entity';
import { MedicalAlert } from './medical_alert.entity';
import { PatientAttachment } from './patient_attachment.entity';

@Entity({ name: 'patients' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Habit, (habit) => habit.patient, { cascade: true })
  habit: Habit;

  @OneToMany(() => MedicalAlert, (alert) => alert.patient, { cascade: true })
  medical_alerts: MedicalAlert[];

  @OneToMany(() => PatientAttachment, (attachment) => attachment.patient, {
    cascade: true,
  })
  attachments: PatientAttachment[];

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  last_appointment: Date;

  @Column({ type: 'date', nullable: true })
  next_appointment: Date;

  @Column({ type: 'varchar' })
  insurance: string;

  @Column({ type: 'varchar' })
  insurance_id: string;

  @Column({ type: 'varchar' })
  dni: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'text' })
  notes: string;

  @Column('bool', {
    default: false,
  })
  is_deleted: boolean;

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
}
