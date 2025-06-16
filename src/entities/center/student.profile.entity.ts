import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Application } from '../admissions/application.entity';

@Entity('student_profile')
export class StudentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  highSchool: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  workingCompany: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  companyPosition: string;

  @Column({ nullable: true })
  portfolio: string;

  @OneToOne(() => Student, (student) => student.studentProfile)
  @JoinColumn()
  student: Student;

  @OneToOne(() => Application, (application) => application.studentProfile)
  @JoinColumn()
  application: Application;
}
