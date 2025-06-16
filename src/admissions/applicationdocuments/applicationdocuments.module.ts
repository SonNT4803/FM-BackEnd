import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationdocumentsController } from './applicationdocuments.controller';
import { ApplicationdocumentsService } from './applicationdocuments.service';
import { ApplicationDocument } from 'src/entities/admissions/application.documents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationDocument])],
  controllers: [ApplicationdocumentsController],
  providers: [ApplicationdocumentsService],
})
export class ApplicationdocumentsModule {}
