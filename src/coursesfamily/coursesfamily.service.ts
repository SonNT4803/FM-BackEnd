import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Courses } from 'src/entities/courses.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesFamilyService {
  constructor(
    @InjectRepository(CoursesFamily)
    private coursesFamilyRepository: Repository<CoursesFamily>,
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
  ) {}

  async create(
    course_family_name: string,
    year: string,
    courseIds: Array<number>,
    code: string,
  ): Promise<CoursesFamily> {
    const coursesFamily = this.coursesFamilyRepository.create({
      course_family_name,
      year,
      code,
    });

    const courses = await this.coursesRepository.findByIds(courseIds);

    coursesFamily.courses = courses;

    return this.coursesFamilyRepository.save(coursesFamily);
  }

  // Get all CoursesFamily
  async findAll(): Promise<CoursesFamily[]> {
    return this.coursesFamilyRepository.find({ relations: ['courses'] });
  }

  // Get a single CoursesFamily by ID
  async findOne(id: number): Promise<CoursesFamily> {
    const coursesFamily = await this.coursesFamilyRepository.findOne({
      where: { course_family_id: id },
      relations: ['courses'],
    });
    if (!coursesFamily) {
      throw new NotFoundException(`CoursesFamily with ID ${id} not found`);
    }
    return coursesFamily;
  }

  async update(
    id: number,
    course_family_name: string,
    year: string,
    code: string,
    coursesId: Array<number>,
  ): Promise<CoursesFamily> {
    const coursesFamily = await this.findOne(id);

    coursesFamily.course_family_name = course_family_name;
    coursesFamily.year = year;
    const courses = await this.coursesRepository.findByIds(coursesId);
    coursesFamily.courses = courses;

    return this.coursesFamilyRepository.save(coursesFamily);
  }

  async remove(id: number): Promise<void> {
    const coursesFamily = await this.findOne(id);
    await this.coursesFamilyRepository.remove(coursesFamily);
  }
}
