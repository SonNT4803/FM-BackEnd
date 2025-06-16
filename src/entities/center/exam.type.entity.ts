import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('exam_types')
export class ExamType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ length: 255, nullable: true })
  description: string;
}
