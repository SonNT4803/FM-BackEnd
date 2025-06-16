import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAiEntity } from './base.entity';

@Entity()
export class StudentResit extends BaseAiEntity {
  @Column()
  studentId: number;

  @Column()
  moduleId: number;

  @Column()
  classId: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ nullable: true })
  note: string;
}
