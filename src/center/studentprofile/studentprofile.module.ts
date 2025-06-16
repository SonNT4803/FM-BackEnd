import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentprofileController } from './studentprofile.controller';
import { StudentprofileService } from './studentprofile.service';
import { StudentProfile } from 'src/entities/center/student.profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile])],
  controllers: [StudentprofileController],
  providers: [StudentprofileService],
})
export class StudentprofileModule {}
