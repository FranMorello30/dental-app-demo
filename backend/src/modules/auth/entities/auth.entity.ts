import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'char',
    length: 150,
    nullable: false,
    unique: true,
    name: 'user_name',
  })
  username: string;

  @Column({ type: 'char', length: 200, nullable: false })
  password?: string;

  @Column({ type: 'char', length: 200, nullable: false })
  nombre: string;

  @Column({ type: 'char', length: 200, nullable: false })
  apellido: string;

  @Column({ type: 'char', length: 20, nullable: false })
  telefono: string;

  @Column({ type: 'char', length: 200, nullable: false })
  email: string;

  @Column({ type: 'char', length: 200 })
  avatar: string;

  @Column({ type: 'char', length: 20, nullable: false, default: 'OPERADOR' })
  rol: string;

  @Column({ type: 'date', nullable: true })
  ultimo_acceso: Date;

  @Column({ type: 'timestamp' })
  fecha_creacion?: Date;

  @Column({ type: 'timestamp' })
  fecha_actualizacion?: Date;

  @Column('bool', {
    default: true,
    name: 'is_active',
  })
  isActive?: boolean;

  // @OneToMany(
  //   () => Disponibilidad,
  //   (disponibilidad) => disponibilidad.odontologo,
  // )
  // disponibilidades: Disponibilidad[];

  @BeforeInsert()
  valirdarCheck() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeInsert()
  protected setCreatedAt(): void {
    this.fecha_creacion = new Date();
  }

  @BeforeUpdate()
  valirdarCheckUpdate() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  protected setUpdatedAt(): void {
    this.fecha_actualizacion = new Date();
  }
}
