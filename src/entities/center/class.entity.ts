import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Attendance } from '../attendance.entity';
import { BaseAiEntity } from '../base.entity';
import { CoursesFamily } from '../courses.family.entity';
import { ClassStatus } from '../enum/class_status.enum';
import { Schedule } from '../schedule.entity';
import { Student } from './student.entity';
import { Cohort } from './cohort.entity';
import { Semester } from '../semester.entity';

@Entity('classes')
export class Class extends BaseAiEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  deleteAt: string;

  @Column({ nullable: true, type: 'enum', enum: ClassStatus })
  status: ClassStatus;

  @Column({ nullable: true, type: 'date' })
  admissionDate: string;

  @ManyToOne(() => Semester, (semester) => semester.class)
  semester: Semester;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  @OneToMany(() => Schedule, (schedule) => schedule.class)
  schedules: Schedule[];

  @OneToMany(() => Attendance, (att) => att.class)
  attendance: Attendance;

  @ManyToOne(() => CoursesFamily, (coursesFamily) => coursesFamily.classes)
  coursesFamily: CoursesFamily;

  @ManyToOne(() => Cohort, (cohort) => cohort.class)
  cohort: Cohort;
}
