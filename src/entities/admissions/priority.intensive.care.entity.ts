import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PriorityIntensiveCare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  priorityId: number;

  @Column({ nullable: true })
  intensiveCareId: number;
}
