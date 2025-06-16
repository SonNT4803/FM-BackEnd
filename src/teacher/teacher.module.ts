import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/entities/teacher.entity';
import { Shift } from 'src/entities/shift.entity';
import { Module as me } from 'src/entities/module.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Shift, me])],
  providers: [TeacherService],
  controllers: [TeacherController],
})
export class TeacherModule { }
