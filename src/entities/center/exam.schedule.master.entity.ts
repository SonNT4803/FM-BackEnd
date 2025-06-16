import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Module } from '../module.entity';
import { ExamRoom } from './exam.room.entity';
import { ExamType } from './exam.type.entity';

@Entity('exam_schedule_master')
export class ExamScheduleMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Module)
  module: Module;

  @ManyToOne(() => ExamType)
  exam_type: ExamType;

  @Column({ type: 'date', nullable: true })
  exam_date: string;

  @Column({ type: 'time', nullable: true })
  start_time: string;

  @Column({ type: 'time', nullable: true })
  end_time: string;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  // Thông tin thi lại
  @Column({ type: 'date', nullable: true })
  retake_date: string;

  @Column({ type: 'time', nullable: true })
  retake_start_time: string;

  @Column({ type: 'time', nullable: true })
  retake_end_time: string;

  @OneToMany(() => ExamRoom, (examRoom) => examRoom.exam_schedule_master)
  exam_rooms: ExamRoom[];
}
