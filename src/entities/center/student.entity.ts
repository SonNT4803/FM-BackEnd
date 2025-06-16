import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Application } from '../admissions/application.entity';
import { IntensiveCare } from '../admissions/intensive.care.entity';
import { Attendance } from '../attendance.entity';
import { BaseAiEntity } from '../base.entity';
import { CoursesFamily } from '../courses.family.entity';
import { StudentStatus } from '../enum/student-study-status.enum';
import { Evaluation } from '../evaluation.entity';
import { GradeFinal } from '../grades/grades.entity';
import { StudentModuleGradeComponent } from '../grades/student.module.gc.entity';
import { Parent } from '../parent.entity';
import { Class } from './class.entity';
import { Cohort } from './cohort.entity';
import { StudentProfile } from './student.profile.entity';

@Entity('students')
export class Student extends BaseAiEntity {
  @Column({ length: 50, nullable: true })
  studentId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthdate: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ nullable: true })
  permanentResidence: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  cardId: string;

  @Column({ type: 'enum', enum: StudentStatus, nullable: true })
  status?: StudentStatus;

  @ManyToOne(() => Class, (classEntity) => classEntity.students, {
    nullable: true,
  })
  class?: Class;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @ManyToOne(() => CoursesFamily, (coursesFamily) => coursesFamily.students, {
    nullable: true,
  })
  coursesFamily: CoursesFamily;

  @OneToOne(() => Application, (application) => application.student)
  @JoinColumn()
  application: Application;

  @ManyToOne(() => Cohort, (cohort) => cohort.student, {
    nullable: true,
  })
  @JoinColumn()
  cohort: Cohort;

  @OneToMany(() => Parent, (parent) => parent.student)
  parent: Parent[];

  @OneToOne(() => StudentProfile, (studentProfile) => studentProfile.student)
  @JoinColumn()
  studentProfile: StudentProfile;

  @OneToMany(() => IntensiveCare, (intensiveCare) => intensiveCare.application)
  intensiveCare: IntensiveCare[];

  @OneToMany(() => GradeFinal, (gradeFinal) => gradeFinal.student)
  grade: GradeFinal[];

  @OneToMany(
    () => StudentModuleGradeComponent,
    (studentGrade) => studentGrade.student,
  )
  studentModuleGradeComponents: StudentModuleGradeComponent[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.student)
  evaluation: Evaluation[];

  @Column({ default: 0, nullable: true })
  total_retake_attempts: number;

  @Column({ nullable: true })
  userId: number;
}
