import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionProgram } from 'src/entities/admissions/admission.program.entity';
import { Application } from 'src/entities/admissions/application.entity';
import { AttachedDocuments } from 'src/entities/admissions/attached.documents.entity';
import { IntensiveCare } from 'src/entities/admissions/intensive.care.entity';
import { Priority } from 'src/entities/admissions/priority.entity';
import { PriorityIntensiveCare } from 'src/entities/admissions/priority.intensive.care.entity';
import { Cohort } from 'src/entities/center/cohort.entity';
import { Student } from 'src/entities/center/student.entity';
import { StudentProfile } from 'src/entities/center/student.profile.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Parent } from 'src/entities/parent.entity';
import { AdmissionprogramModule } from '../admissionprogram/admissionprogram.module';
import { AttacheddocumentsModule } from '../attacheddocuments/attacheddocuments.module';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      AttachedDocuments,
      AdmissionProgram,
      CoursesFamily,
      Student,
      PriorityIntensiveCare,
      Cohort,
      Parent,
      IntensiveCare,
      Priority,
      StudentProfile,
    ]),
    AttacheddocumentsModule,
    AdmissionprogramModule,
  ],
  providers: [ApplicationService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
