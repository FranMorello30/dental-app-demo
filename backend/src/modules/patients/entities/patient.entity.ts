import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'patients' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  last_appointment: Date;

  @Column({ type: 'date', nullable: true })
  next_appointment: Date;

  @Column({ type: 'varchar' })
  insurance: string;

  @Column({ type: 'varchar' })
  insurance_id: string;

  @Column({ type: 'varchar' })
  dni: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

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
}
