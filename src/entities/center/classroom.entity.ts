import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseAiEntity } from '../base.entity';
import { Building } from './building.entity';
import { Schedule } from '../schedule.entity';

@Entity('classrooms')
export class Classroom extends BaseAiEntity {
  @Column({ length: 25, unique: true })
  name: string;

  @ManyToOne(() => Building, { eager: true })
  building: Building;

  @OneToMany(() => Schedule, (schedule) => schedule.classroom)
  schedules: Schedule[];
}
