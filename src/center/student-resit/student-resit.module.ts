import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentResitController } from './student-resit.controller';
import { StudentResitService } from './student-resit.service';
import { StudentResit } from '../../entities/student-resit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentResit])],
  controllers: [StudentResitController],
  providers: [StudentResitService],
  exports: [StudentResitService],
})
export class StudentResitModule {}
