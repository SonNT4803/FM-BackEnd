import { Entity, Column } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity('buildings')
export class Building extends BaseAiEntity {
  @Column()
  name: string;
}
