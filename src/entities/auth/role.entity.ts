import { Column, Entity } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity('roles')
export class Role extends BaseAiEntity {
  @Column()
  name: string;
}
