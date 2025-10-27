import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Dentist } from './dentist.entity';
import { DentistSchedule } from './dentist-schedules.entity';

@Entity({ name: 'dentist_breaks' })
export class DentistBreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @ManyToOne(() => DentistSchedule, (schedule) => schedule.id)
  schedule: DentistSchedule;

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
}
