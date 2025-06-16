import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { Class } from 'src/entities/center/class.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Shift } from 'src/entities/shift.entity';
import { Module as me } from 'src/entities/module.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/const';
import { Courses } from 'src/entities/courses.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Schedule, Class, Teacher, Shift, me, Classroom, Courses]),
    JwtModule.register({
      secret: jwtConstants, // Thay bằng bí mật của bạn
      signOptions: { expiresIn: '365d' }, // Thời gian sống của token
    }),
  ],
  providers: [ScheduleService],
  controllers: [ScheduleController],
})
export class ScheduleModule { }
