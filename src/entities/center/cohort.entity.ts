import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Class } from './class.entity';

@Entity()
export class Cohort {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  status: string;

  @OneToMany(() => Student, (student) => student.cohort)
  student: Student[];

  @OneToMany(() => Class, (classEntity) => classEntity.cohort)
  class: Class[];
}
