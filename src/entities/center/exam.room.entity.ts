import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ExamScheduleMaster } from './exam.schedule.master.entity';
import { Classroom } from './classroom.entity';
import { Teacher } from '../teacher.entity';
import { ExamRoomStudent } from './exam.room.student.entity';

@Entity('exam_rooms')
export class ExamRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExamScheduleMaster)
  exam_schedule_master: ExamScheduleMaster;

  @ManyToOne(() => Classroom)
  classroom: Classroom;

  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @Column()
  capacity: number;

  @OneToMany(() => ExamRoomStudent, (examStudent) => examStudent.exam_room)
  exam_room_students: ExamRoomStudent[];
}
