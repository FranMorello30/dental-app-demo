import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'habits' })
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  smoking: boolean;

  @Column({ type: 'boolean', default: false })
  alcohol: boolean;

  @Column({ type: 'boolean', default: false })
  bruxism: boolean;

  @Column({ type: 'varchar', nullable: true })
  flossing: string;

  @Column({ type: 'varchar', nullable: true, name: 'brushing_frequency' })
  brushingFrequency: string;

  @OneToOne(() => Patient, (patient) => patient.habit, { onDelete: 'CASCADE' })
  @JoinColumn()
  patient: Patient;

  @Column({ type: 'uuid' })
  patientId: string;
}
