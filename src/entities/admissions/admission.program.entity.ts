import { Column, Entity } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity()
export class AdmissionProgram extends BaseAiEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 10000 })
  description: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'date' })
  startRegistration: string;

  @Column({ type: 'date' })
  endRegistration: string;

  @Column({ type: 'int' })
  quota: number;
}
