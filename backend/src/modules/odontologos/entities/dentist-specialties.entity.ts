import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Dentist } from './dentist.entity';
import { Specialty } from '../../specialties/entities/specialty.entity';

@Entity('dentist_specialties')
@Unique(['dentist', 'specialty'])
export class DentistSpecialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dentist, (dentist) => dentist.specialties, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  dentist: Dentist;

  @ManyToOne(() => Specialty, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  specialty: Specialty;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
