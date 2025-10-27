import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';

import { DentistSchedule } from './dentist-schedules.entity';
import { DentistUnavailability } from './dentist-unavailabilities.entity';

@Entity('dentists')
export class Dentist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar' })
  avatar: string;

  // @Column({
  //   type: 'enum',
  //   enum: [
  //     'Odontología General',
  //     'Ortodoncia',
  //     'Endodoncia',
  //     'Periodoncia',
  //     'Cirugía Oral',
  //     'Odontopediatría',
  //   ],
  //   default: 'Odontología General',
  // })
  @Column({ type: 'varchar' })
  specialty: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  nro_Id: number;

  @Column({
    type: 'varchar',
    name: 'license_number',
    unique: true,
    nullable: false,
  })
  license_number: string;

  @Column({ type: 'text', nullable: true })
  notes: Date;

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

  // @OneToMany(() => Agenda, (agenda) => agenda.odontologo)
  // agendas: Agenda[];

  @Column('bool', {
    default: true,
    name: 'is_active',
  })
  is_active?: boolean;

  // @OneToMany(() => DiaLibre, (diaLibre) => diaLibre.odontologo)
  // diasLibres: DiaLibre[];

  // @Column({
  //   type: 'enum',
  //   enum: ['TIEMPO_COMPLETO', 'TIEMPO_PARCIAL'],
  //   default: 'TIEMPO_COMPLETO',
  // })
  // tiempo: 'TIEMPO_COMPLETO' | 'TIEMPO_PARCIAL';

  // @OneToMany(() => Inventario, (inv) => inv.odontologo)
  // inventarios: Inventario[];

  // @OneToMany(() => Servicio, (sr) => sr.odontologo)
  // servicios: Servicio[];

  @OneToMany(() => DentistSchedule, (schedule) => schedule.dentist)
  schedules: DentistSchedule[];

  @OneToMany(
    () => DentistUnavailability,
    (unavailability) => unavailability.dentist,
  )
  unavailabilities: DentistUnavailability[];

  // @BeforeInsert()
  // valirdarCheck() {
  //   this.email = this.email.toLowerCase().trim();
  // }

  // @BeforeInsert()
  // protected setCreatedAt(): void {
  //   this.fecha_creacion = new Date();
  // }

  // @BeforeUpdate()
  // valirdarCheckUpdate() {
  //   this.email = this.email.toLowerCase().trim();
  // }

  // @BeforeUpdate()
  // protected setUpdatedAt(): void {
  //   this.fecha_actualizacion = new Date();
  // }
}
