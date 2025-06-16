import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseAiEntity } from './base.entity';
import { Schedule } from './schedule.entity';

@Entity('shifts')
export class Shift extends BaseAiEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @OneToMany(() => Schedule, (schedule) => schedule.shift)
  schedules: Schedule[];

}
