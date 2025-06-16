import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Module } from './module.entity';
import { CoursesFamily } from './courses.family.entity';

@Entity()
export class Courses {
  @PrimaryGeneratedColumn()
  course_id: number;

  @Column({ length: 100 })
  course_name: string;

  @Column({ length: 100 })
  course_code: string;

  @ManyToMany(() => CoursesFamily, (courseFamily) => courseFamily.courses)
  @JoinTable({
    name: 'courses_courses_family',
    joinColumn: { name: 'course_id', referencedColumnName: 'course_id' },
    inverseJoinColumn: {
      name: 'course_family_id',
      referencedColumnName: 'course_family_id',
    },
  })
  course_families: CoursesFamily[];

  @ManyToMany(() => Module, (module) => module.courses)
  modules: Module[];
}
