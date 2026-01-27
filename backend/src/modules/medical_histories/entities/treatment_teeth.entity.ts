import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MedicalHistory } from './medical_history.entity';

@Entity({ name: 'treatment_teeth' })
export class TreatmentTeeth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'text' })
  treatment: string;

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

  //   @ManyToOne(() => MedicalHistory, (medical) => medical.treatment_teeth, {
  //     onDelete: 'CASCADE',
  //   })
  //   medical: MedicalHistory;
}
