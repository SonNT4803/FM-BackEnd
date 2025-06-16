import { Module } from '@nestjs/common';
import { ExamtypeService } from './examtype.service';
import { ExamtypeController } from './examtype.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamType } from 'src/entities/center/exam.type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamType])],
  providers: [ExamtypeService],
  controllers: [ExamtypeController],
})
export class ExamtypeModule {}
