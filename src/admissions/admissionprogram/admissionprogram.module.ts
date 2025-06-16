import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionprogramService } from './admissionprogram.service';
import { AdmissionprogramController } from './admissionprogram.controller';
import { AProgramApplicationDocument } from 'src/entities/admissions/a.program_application.documents.entity';
import { ApplicationDocument } from 'src/entities/admissions/application.documents.entity';
import { ProgramPromotion } from 'src/entities/admissions/a.program_promotion.entity';
import { AdmissionProgram } from 'src/entities/admissions/admission.program.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdmissionProgram,
      AProgramApplicationDocument,
      ApplicationDocument,
      ProgramPromotion,
    ]),
  ],
  providers: [AdmissionprogramService],
  exports: [AdmissionprogramService],
  controllers: [AdmissionprogramController],
})
export class AdmissionprogramModule {}
