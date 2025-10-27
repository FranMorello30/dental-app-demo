import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TreatmentPlan } from './treatment_plan.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'treatment_procedures' })
export class TreatmentProcedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({
    type: 'date',
  })
  scheduled_date: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  completed_date: Date;

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

  @ManyToOne(() => TreatmentPlan, (trat) => trat.id, { cascade: true })
  @Exclude({ toPlainOnly: true })
  plan: TreatmentPlan;
}
