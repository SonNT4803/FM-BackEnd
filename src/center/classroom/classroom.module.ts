import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Building } from 'src/entities/center/building.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom, Building])],
  providers: [ClassroomService],
  controllers: [ClassroomController],
  exports: [ClassroomService],
})
export class ClassroomModule {}
