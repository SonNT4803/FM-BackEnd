// attendance.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Class } from './center/class.entity';
import { Student } from './center/student.entity';
import { Schedule } from './schedule.entity';
import { Teacher } from './teacher.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ length: 200, nullable: true })
  note: string;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.attendances)
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.attendances)
  student: Student;

  @ManyToOne(() => Class, (classEntity) => classEntity.attendance)
  class: Class;

  @ManyToOne(() => Schedule, (schedule) => schedule.attendances)
  schedule: Schedule;
}
