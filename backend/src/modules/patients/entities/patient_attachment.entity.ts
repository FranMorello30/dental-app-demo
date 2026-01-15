import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_attachments' })
export class PatientAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  original_name: string;

  @Column({ type: 'varchar' })
  filename: string;

  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'int' })
  size: number;

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

  @ManyToOne(() => Patient, (patient) => patient.attachments, {
    onDelete: 'CASCADE',
  })
  patient: Patient;
}
