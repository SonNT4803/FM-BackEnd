import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Courses } from 'src/entities/courses.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Module } from 'src/entities/module.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Courses)
    private coursesRepository: Repository<Courses>,
    @InjectRepository(CoursesFamily)
    private coursesFamilyRepository: Repository<CoursesFamily>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  // Create a new course
  async create(
    course_name: string,
    course_code: string,
    modulesId: Array<number>,
  ): Promise<Courses> {
    // Tìm các Module theo ID
    const modules = await this.moduleRepository.findByIds(modulesId);

    // Tạo mới đối tượng Courses
    const course = this.coursesRepository.create({
      course_name,
      course_code,
      modules,
    });

    // Lưu vào cơ sở dữ liệu
    return this.coursesRepository.save(course);
  }

  // Get all courses
  async findAll(): Promise<Courses[]> {
    return this.coursesRepository.find({
      relations: ['course_families', 'modules'],
    });
  }

  // Get a single course by ID
  async findOne(id: number): Promise<Courses> {
    const course = await this.coursesRepository.findOne({
      where: { course_id: id },
      relations: ['modules'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  // Update a course by ID
  async update(
    course_id: number,
    course_name: string,
    course_code: string,
    modulesId: Array<number>,
  ): Promise<Courses> {
    const course = await this.findOne(course_id);

    course.course_name = course_name;
    course.course_code = course_code;
    const modules = await this.moduleRepository.findByIds(modulesId);
    course.modules = modules;

    return this.coursesRepository.save(course);
  }

  // Delete a course by ID
  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
  }
}
