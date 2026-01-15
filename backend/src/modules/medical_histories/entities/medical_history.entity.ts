import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TreatedTeeth } from './treated_teeth.entity';
import { MedicalAttachment } from './medical_attachment.entity';
import { Dentist } from '../../odontologos/entities/dentist.entity';
import { Patient } from '../../patients/entities/patient.entity';

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

  @ManyToOne(() => Dentist)
  dentist: Dentist;

  @ManyToOne(() => Patient)
  patient: Patient;

  @OneToMany(() => MedicalAttachment, (attachment) => attachment.medical, {
    cascade: true,
  })
  attachments: MedicalAttachment[];

  @OneToMany(() => TreatedTeeth, (tooth) => tooth.medical, { cascade: true })
  treated_teeth: TreatedTeeth[];
}
