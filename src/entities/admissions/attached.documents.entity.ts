import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAiEntity } from '../base.entity';
import { Application } from './application.entity';

@Entity()
export class AttachedDocuments extends BaseAiEntity {
  @Column({ nullable: true })
  documentType?: string;

  @Column()
  filePath: string;

  @ManyToOne(() => Application, (application) => application.attachedDocuments)
  @JoinColumn()
  application?: Application;
}
