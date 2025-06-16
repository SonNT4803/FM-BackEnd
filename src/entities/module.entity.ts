import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Courses } from './courses.entity';
import { GradeCategory } from './grades/grade.category.entity';
import { Semester } from './semester.entity';

@Entity()
export class Module {
  @PrimaryGeneratedColumn()
  module_id: number;

  @Column({ length: 50, unique: true })
  module_name: string;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column()
  number_of_classes: number;

  @ManyToOne(() => Semester, (semester) => semester.module)
  semester: Semester;

  @ManyToMany(() => Courses, (course) => course.modules)
  @JoinTable()
  courses: Courses[];

  @OneToMany(() => GradeCategory, (gradeCategory) => gradeCategory.module)
  gradeCategories: GradeCategory[];
}
