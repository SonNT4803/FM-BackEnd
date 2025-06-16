import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './center/student.entity';
import { Teacher } from './teacher.entity';
import { EvaluationLevel } from './enum/evaluation-level.enum';

@Entity('evaluation')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.evaluation)
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.evaluation)
  teacher: Teacher;

  @Column({ nullable: true, type: 'enum', enum: EvaluationLevel })
  level: EvaluationLevel;

  @Column({ nullable: true })
  comments: string;
}
