import { Dentist } from 'src/modules/odontologos/entities/dentist.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DentistBreak } from './dentist-breaks.entity';

@Entity({ name: 'dentist_schedules' })
export class DentistSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({
  //   type: 'enum',
  //   enum: [
  //     'Lunes',
  //     'Martes',
  //     'Miércoles',
  //     'Jueves',
  //     'Viernes',
  //     'Sábado',
  //     'Domingo',
  //   ],
  // })
  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  // @Column({ type: 'text' })
  // odontologo: string;

  @Column({ type: 'bool', default: true }) // Puede ser nulo para tiempo completo
  is_working_day: boolean;

  // @Column({ type: 'simple-array', nullable: true })
  // diasLaborales: string;

  @ManyToOne(() => Dentist, (dentist) => dentist.id, { cascade: true })
  // @JoinColumn({ name: 'odontologo_id' })
  dentist: Dentist;

  @OneToMany(() => DentistBreak, (dentistBreak) => dentistBreak.schedule)
  breaks: DentistBreak[];

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
