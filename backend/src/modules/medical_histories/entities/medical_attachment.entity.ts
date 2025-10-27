import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MedicalHistory } from './medical_history.entity';

@Entity({ name: 'medical_attachments' })
export class MedicalAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  file_type: string;

  @Column({ type: 'text' })
  file_path: string;

  @Column({ type: 'int' })
  file_size: number;

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
