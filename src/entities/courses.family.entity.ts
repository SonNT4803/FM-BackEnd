import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from './center/class.entity';
import { Courses } from './courses.entity';
import { Student } from './center/student.entity';
import { Application } from './admissions/application.entity';

@Entity()
export class CoursesFamily {
  @PrimaryGeneratedColumn()
  course_family_id: number;

  @Column()
  course_family_name: string;

  @Column()
  year: string;

  @Column({ nullable: true })
  code: string;

  @ManyToMany(() => Courses, (course) => course.course_families)
  courses: Courses[];

  @OneToMany(() => Student, (student) => student.coursesFamily)
  students: Student[];

  @OneToMany(() => Application, (application) => application.coursesFamily)
  application: Application[];

  @OneToMany(() => Class, (classEntity) => classEntity.coursesFamily)
  classes: Class[];
}
