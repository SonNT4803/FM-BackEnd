import { Entity, ManyToOne } from 'typeorm';
import { AdmissionProgram } from './admission.program.entity';
import { BaseAiEntity } from '../base.entity';
import { ApplicationDocument } from './application.documents.entity';

@Entity('admission_program_application_document')
export class AProgramApplicationDocument extends BaseAiEntity {
  @ManyToOne(() => AdmissionProgram, (program) => program.id, {
    onDelete: 'CASCADE',
  })
  admissionProgram: AdmissionProgram;

  @ManyToOne(() => ApplicationDocument, (document) => document.id, {
    onDelete: 'CASCADE',
  })
  applicationDocument: ApplicationDocument;
}
