import { Dentist } from 'src/modules/odontologos/entities/dentist.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'medical_history' })
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  diagnosis: string;

  @Column({ type: 'text' })
  treatment: string;

  @Column({ type: 'text' })
  medications: string;

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

  @ManyToOne(() => Dentist, (dentist) => dentist.id, { cascade: true })
  dentist: Dentist;

  @ManyToOne(() => Patient, (patient) => patient.id, { cascade: true })
  patient: Patient;
}
