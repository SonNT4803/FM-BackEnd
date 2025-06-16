import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Application } from './admissions/application.entity';
import { Student } from './center/student.entity';

@Entity('parent')
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  job: string;

  @ManyToOne(() => Student, (student) => student.parent)
  student: Student;

  @ManyToOne(() => Application, (application) => application.parent)
  application: Application;
}
