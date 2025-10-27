import { Patient } from 'src/modules/patients/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TreatmentProcedure } from './treatment_procedure.entity';

@Entity({ name: 'treatment_plans' })
export class TreatmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'date',
  })
  start_date: Date;

  @Column({ type: 'int' })
  progress: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paid_amount: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  estimated_end_date: Date;

  @Column({ type: 'varchar', default: 'pendiente' })
  status: string;

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

  @ManyToOne(() => Patient, (patient) => patient.id, { cascade: true })
  patient: Patient;

  @OneToMany(() => TreatmentProcedure, (procedure) => procedure.plan, {
    eager: true,
  })
  procedures: TreatmentProcedure[];
}
