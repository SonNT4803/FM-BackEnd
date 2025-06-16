import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../center/student.entity';
import { Module } from '../module.entity';

@Entity()
export class GradeFinal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  average_grade: number;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  remarks: string;

  @ManyToOne(() => Student, (student) => student.grade)
  student: Student;

  @Column({ default: 1 })
  attempt: number; // 1 for first attempt, 2 for resit

  // @Column({ nullable: true })
  // first_attempt_grade: number;

  @Column({ type: 'date', nullable: true })
  retake_date: string; // Ngày bắt đầu học lại gần nhất

  @ManyToOne(() => Module)
  module: Module;
}
