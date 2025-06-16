import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ExamRoom } from './exam.room.entity';
import { Student } from './student.entity';

@Entity('exam_room_students')
export class ExamRoomStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExamRoom)
  exam_room: ExamRoom;

  @ManyToOne(() => Student)
  student: Student;

  @Column({ type: 'boolean', nullable: true, default: null })
  is_present: boolean | null;

  @Column({ nullable: true })
  note: string;
}
