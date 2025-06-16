import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Shift } from './shift.entity';
import { Module } from './module.entity';
import { Schedule } from './schedule.entity';
import { Evaluation } from './evaluation.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date' })
  birthdate: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column()
  email: string;

  @Column({ type: 'date' })
  working_date: Date;

  @OneToMany(() => Attendance, (att) => att.teacher)
  attendances: Attendance;

  @ManyToMany(() => Shift, { nullable: true })
  @JoinTable()
  working_shift: Shift[];

  @ManyToMany(() => Module, { nullable: true })
  @JoinTable()
  modules: Module[];

  @OneToMany(() => Schedule, (schedule) => schedule.teacher)
  schedules: Schedule[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.teacher)
  evaluation: Evaluation[];
}
