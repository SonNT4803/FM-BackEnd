import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GradeCategory } from './grade.category.entity';
import { StudentModuleGradeComponent } from './student.module.gc.entity';
import { GradeComponentStatus } from '../enum/gradecomponent.enum';

@Entity()
export class GradeComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ví dụ: "Lab 1", "Progress Test 1"

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  weight: number | null;

  @Column({ type: 'enum', enum: GradeComponentStatus, nullable: true })
  status: GradeComponentStatus;

  @ManyToOne(
    () => GradeCategory,
    (gradeCategory) => gradeCategory.gradeComponents,
    { onDelete: 'CASCADE' },
  )
  gradeCategory: GradeCategory;

  @OneToMany(
    () => StudentModuleGradeComponent,
    (studentGrade) => studentGrade.gradeComponent,
    { onDelete: 'CASCADE' },
  )
  studentGrades: StudentModuleGradeComponent[];
}
