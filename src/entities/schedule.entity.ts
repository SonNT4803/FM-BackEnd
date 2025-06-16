import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Attendance } from './attendance.entity';
import { BaseAiEntity } from './base.entity';
import { Class } from './center/class.entity';
import { Classroom } from './center/classroom.entity';
import { Module } from './module.entity';
import { Shift } from './shift.entity';
import { Teacher } from './teacher.entity';

@Entity('schedules')
export class Schedule extends BaseAiEntity {
  @ManyToOne(() => Shift, { eager: true })
  shift: Shift;

  @ManyToOne(() => Class, { eager: true })
  class: Class;

  @ManyToOne(() => Classroom, { eager: true })
  classroom: Classroom;

  @ManyToOne(() => Teacher, { eager: true })
  teacher: Teacher;

  @Column({ type: 'date', nullable: true })
  date: string;

  @ManyToOne(() => Module, { eager: true })
  module: Module;

  @Column({
    type: 'enum',
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    nullable: false,
  })
  dayOfWeek: string;

  @OneToMany(() => Attendance, (attendance) => attendance.schedule)
  attendances: Attendance[];
}
