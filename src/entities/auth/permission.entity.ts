import { Column, Entity } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity('permissions')
export class Permission extends BaseAiEntity {
  @Column()
  module: string;

  @Column()
  action: string;
}
