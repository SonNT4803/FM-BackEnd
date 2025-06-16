import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Module } from './module.entity';
import { Class } from './center/class.entity';

@Entity()
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Tên kỳ học, ví dụ: "Học kỳ 1"

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  term_number: number;

  @OneToMany(() => Module, (module) => module.semester, {
    onDelete: 'CASCADE', // Xóa các module khi xóa semeste
    onUpdate: 'CASCADE', // Cập nhật các module khi cập nhật semester
  })
  module: Module[];

  @OneToMany(() => Class, (c) => c.semester, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  class: Class[];
}
