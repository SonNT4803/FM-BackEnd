import { Column, Entity } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity()
export class ApplicationDocument extends BaseAiEntity {
  @Column()
  name: string;
}
