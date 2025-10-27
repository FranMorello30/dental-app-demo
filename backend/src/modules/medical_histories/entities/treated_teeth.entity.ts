import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MedicalHistory } from './medical_history.entity';

@Entity({ name: 'treated_teeth' })
export class TreatedTeeth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  tooth_number: number;

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

  @ManyToOne(() => MedicalHistory, (medical) => medical.id, { cascade: true })
  medical: MedicalHistory;
}
