import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttacheddocumentsService } from './attacheddocuments.service';
import { AttacheddocumentsController } from './attacheddocuments.controller';
import { Application } from 'src/entities/admissions/application.entity';
import { AttachedDocuments } from 'src/entities/admissions/attached.documents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttachedDocuments, Application])],
  providers: [AttacheddocumentsService],
  exports: [AttacheddocumentsService],
  controllers: [AttacheddocumentsController],
})
export class AttacheddocumentsModule {}
