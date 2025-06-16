import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentProfile } from 'src/entities/center/student.profile.entity';
import { Repository } from 'typeorm';
import { CreateStudentProfileDto } from './dto/student.profile.dto';

@Injectable()
export class StudentprofileService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async findAll(): Promise<StudentProfile[]> {
    return this.studentProfileRepository.find();
  }

  async create(
    createStudentProfileDto: CreateStudentProfileDto,
  ): Promise<StudentProfile> {
    const studentProfile = this.studentProfileRepository.create(
      createStudentProfileDto,
    );

    // Save the StudentProfile first
    const savedStudentProfile =
      await this.studentProfileRepository.save(studentProfile);

    // Return the saved StudentProfile
    return savedStudentProfile;
  }
}
