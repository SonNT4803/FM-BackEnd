import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Module } from 'src/entities/module.entity';
import { Raw, Repository } from 'typeorm';
import { ClassesDto, CreateClassDto } from './dto/classes.dto';
import { Cohort } from 'src/entities/center/cohort.entity';
import { Semester } from 'src/entities/semester.entity';
@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(CoursesFamily)
    private coursesFamilyRepository: Repository<CoursesFamily>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  async findAll(): Promise<ClassesDto[]> {
    const classes = await this.classRepository.find({
      relations: ['students', 'coursesFamily', 'cohort', 'semester'],
    });
    const validClasses = classes
      .filter((c) => c.deleteAt === null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: c.students ? c.students.length : 0,
        status: c.status,
        admissionDate: c.admissionDate,
        courses_family_id: c.coursesFamily.course_family_id,
        cohort: c.cohort,
        semester: c.semester,
      }));

    return validClasses;
  }

  async findAllDeletedClass(): Promise<ClassesDto[]> {
    const classes = await this.classRepository.find({
      relations: ['students'],
    });
    const validClasses = classes
      .filter((c) => c.deleteAt != null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        count: c.students ? c.students.length : 0,
      }));

    return validClasses;
  }

  findOne(id: number): Promise<Class | null> {
    const rs = this.classRepository.findOne({
      where: { id },
      relations: ['coursesFamily', 'cohort', 'students', 'semester'],
    });

    if (!rs) {
      throw new NotFoundException('Không tìm thấy lớp với id: ' + id);
    }

    return rs;
  }

  async create(classEntity: CreateClassDto): Promise<Class> {
    const classInstance = new Class();
    classInstance.name = classEntity.name;
    classInstance.status = classEntity.status;
    classInstance.admissionDate = classEntity.admissionDate;
    if (classEntity.cohort_id) {
      const cohort = await this.cohortRepository.findOne({
        where: { id: classEntity.cohort_id },
      });
      classInstance.cohort = cohort;
    }
    if (classEntity.semester_id) {
      const semester = await this.semesterRepository.findOne({
        where: { id: classEntity.semester_id },
      });
      classInstance.semester = semester;
    }
    // Lấy courseFamily
    const courseFamily = await this.coursesFamilyRepository.findOne({
      where: { course_family_id: classEntity.courses_family_id },
    });
    if (!courseFamily) {
      throw new Error('Không tìm thấy courseFamily');
    }
    classInstance.coursesFamily = courseFamily;

    // Xử lý sinh viên
    if (classEntity.tick === true) {
      const desiredStudentCount = classEntity.studentCount;

      const studentsWithoutClass = await this.studentRepository.find({
        where: {
          class: Raw((alias) => `${alias} IS NULL`),
          coursesFamily: { course_family_id: classEntity.courses_family_id },
        },
        take: desiredStudentCount,
      });

      if (studentsWithoutClass.length < desiredStudentCount) {
        throw new Error(
          `Không đủ số lượng sinh viên. Yêu cầu: ${desiredStudentCount}, hiện có: ${studentsWithoutClass.length}`,
        );
      }

      const savedClass = await this.classRepository.save(classInstance);

      // Gán classId cho học sinh
      for (const student of studentsWithoutClass) {
        student.class = savedClass;
      }

      await this.studentRepository.save(studentsWithoutClass);

      return savedClass;
    } else {
      const savedClass = await this.classRepository.save(classInstance);

      return savedClass;
    }
  }

  async updateClass(
    classId: number,
    updateData: Partial<CreateClassDto>,
  ): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found.`);
    }

    if (updateData.name) {
      classEntity.name = updateData.name;
    }
    if (updateData.courses_family_id) {
      const courseFamily = await this.coursesFamilyRepository.findOne({
        where: { course_family_id: updateData.courses_family_id },
      });
      if (!courseFamily) {
        throw new NotFoundException('CoursesFamily not found');
      }
      classEntity.coursesFamily = courseFamily;
    }
    if (updateData.semester_id) {
      const semester = await this.semesterRepository.findOne({
        where: { id: updateData.semester_id },
      });
      classEntity.semester = semester;
    }
    if (updateData.status) {
      classEntity.status = updateData.status;
    }
    if (updateData.admissionDate) {
      classEntity.admissionDate = updateData.admissionDate;
    }

    if (updateData.cohort_id) {
      const cohort = await this.cohortRepository.findOne({
        where: { id: updateData.cohort_id },
      });
      classEntity.cohort = cohort;
    }

    await this.classRepository.save(classEntity);

    return classEntity;
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    try {
      if (classEntity) {
        classEntity.deleteAt = new Date().toString();
        await this.classRepository.save(classEntity);
      }
    } catch (error) {
      throw error;
    }
  }

  async restore(classId: number): Promise<void> {
    // Tìm class theo ID, bao gồm cả các class đã bị xóa (deleteAt != null)
    const classToRestore = await this.classRepository.findOne({
      where: { id: classId },
      withDeleted: true, // Bao gồm cả các bản ghi đã bị xóa
    });

    // Nếu không tìm thấy class, ném ra lỗi NotFoundException
    if (!classToRestore) {
      throw new NotFoundException(`Class with ID ${classId} not found.`);
    }

    await this.classRepository.update(classId, { deleteAt: null });
  }

  async getModulesByCoursesFamilyOfClass(classId: number): Promise<Module[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: [
        'coursesFamily',
        'coursesFamily.courses',
        'coursesFamily.courses.modules',
      ],
    });

    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp với id: ' + classId);
    }

    const coursesFamily = classEntity.coursesFamily;
    if (!coursesFamily || coursesFamily.courses.length === 0) {
      throw new NotFoundException('Courses Family không có courses nào.');
    }

    const modules = coursesFamily.courses.flatMap((course) => course.modules);
    return modules;
  }
}
