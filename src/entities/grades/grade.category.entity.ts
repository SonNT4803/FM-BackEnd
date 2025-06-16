import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Module } from '../module.entity';
import { GradeComponent } from './grade.component.entity';

@Entity()
export class GradeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  weight: number | null;

  @ManyToOne(() => Module, (module) => module.gradeCategories)
  module: Module;

  @OneToMany(
    () => GradeComponent,
    (gradeComponent) => gradeComponent.gradeCategory,
  )
  gradeComponents: GradeComponent[];
}
