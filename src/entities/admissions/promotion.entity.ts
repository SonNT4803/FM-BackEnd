import { Column, Entity } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity('promotions')
export class Promotion extends BaseAiEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount: number;

  @Column({ nullable: true })
  scholarshipQuantity: number;

  @Column({ length: 1000, nullable: true })
  condition: string;

  @Column({ nullable: true })
  maxQuantity: number;

  @Column()
  registrationMethod: string;
}
