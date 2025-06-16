import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../center/student.entity';
import { Application } from './application.entity';

@Entity()
export class IntensiveCare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000, nullable: true })
  description: string;

  @ManyToOne(() => Application, (application) => application.intensiveCare)
  application: Application;

  @ManyToOne(() => Student, (student) => student.intensiveCare)
  student: Student;
}
