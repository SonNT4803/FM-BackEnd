import { Module } from '@nestjs/common';
import { ExamRoomController } from './exam_room.controller';
import { ExamRoomService } from './exam_room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamRoomStudent } from 'src/entities/center/exam.room.student.entity';
import { ExamRoom } from 'src/entities/center/exam.room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamRoom, ExamRoomStudent])],
  providers: [ExamRoomService],
  controllers: [ExamRoomController],
})
export class ExamRoomModule {}
