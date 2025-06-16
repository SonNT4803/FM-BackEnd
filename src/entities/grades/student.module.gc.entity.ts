import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../center/student.entity';
import { GradeComponent } from './grade.component.entity';

@Entity('student_module_grade_components')
export class StudentModuleGradeComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  score: number | null;

  @ManyToOne(() => Student, (student) => student.studentModuleGradeComponents)
  student: Student;

  @ManyToOne(
    () => GradeComponent,
    (gradeComponent) => gradeComponent.studentGrades,
    { onDelete: 'CASCADE' },
  )
  gradeComponent: GradeComponent;
}
