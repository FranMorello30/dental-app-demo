import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dentist } from './dentist.entity';

@Entity('dentist_unavailabilities')
export class DentistUnavailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  unavailable_date: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ManyToOne(() => Dentist, (dentist) => dentist.unavailabilities, {
    cascade: true,
  })
  dentist: Dentist;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
