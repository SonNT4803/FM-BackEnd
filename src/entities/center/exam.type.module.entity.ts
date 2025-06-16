import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('exam_type_modules')
export class ExamTypeModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exam_type_id: number;

  @Column()
  module_id: number;
}
