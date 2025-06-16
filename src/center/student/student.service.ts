import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Brackets, In, Raw, Repository, Entity } from 'typeorm';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Module } from 'src/entities/module.entity';
import { GradeFinal } from 'src/entities/grades/grades.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { StudentResit } from 'src/entities/student-resit.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(CoursesFamily)
    private readonly coursesFamilyRepository: Repository<CoursesFamily>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(GradeFinal)
    private readonly gradeFinalRepository: Repository<GradeFinal>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(StudentResit)
    private readonly studentResitRepository: Repository<StudentResit>,
  ) {}

  async findStudentsWithoutClass(): Promise<Student[]> {
    return await this.studentRepository.find({
      where: {
        class: Raw((alias) => `${alias} IS NULL`),
      },
      relations: [
        'class',
        'coursesFamily',
        'application',
        'application.admissionProgram',
        'cohort',
      ],
    });
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { classId, courses_family_id, cardId, ...studentData } =
      createStudentDto;

    const student = this.studentRepository.create(studentData);

    const existingStudent = await this.studentRepository.findOne({
      where: { studentId: student.studentId },
    });
    if (existingStudent) {
      throw new ConflictException(`Mã SV ${student.studentId} đã tồn tại`);
    }

    if (cardId) {
      const existingCardId = await this.studentRepository.findOne({
        where: { cardId },
      });
      if (existingCardId) {
        throw new ConflictException(`Card ID ${cardId} đã tồn tại`);
      }
      student.cardId = cardId;
    }

    if (classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
      });
      if (classEntity) {
        student.class = classEntity;
      } else {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }
    }

    if (courses_family_id) {
      student.coursesFamily = await this.coursesFamilyRepository.findOne({
        where: { course_family_id: courses_family_id },
      });
      if (!student.coursesFamily) {
        throw new NotFoundException(
          `CoursesFamily with ID ${courses_family_id} not found`,
        );
      }
    }

    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: [
        'class',
        'attendances',
        'coursesFamily',
        'cohort',
        'application.admissionProgram',
        'evaluation',
      ],
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: [
        'class',
        'attendances',
        'coursesFamily',
        'cohort',
        'parent',
        'grade',
        'studentProfile',
        'evaluation',
      ],
    });
    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const { studentId, classId, courses_family_id, cardId, ...studentData } =
      updateStudentDto;

    if (studentId) {
      const existingStudent = await this.studentRepository.findOne({
        where: { studentId, id: Raw((alias) => `${alias} != ${id}`) },
      });
      if (existingStudent) {
        throw new ConflictException(`Mã SV ${studentId} đã tồn tại`);
      }
    }

    if (cardId) {
      const existingCardId = await this.studentRepository.findOne({
        where: { cardId, id: Raw((alias) => `${alias} != ${id}`) },
      });
      if (existingCardId) {
        throw new ConflictException(`Card ID ${cardId} đã tồn tại`);
      }
    }

    const student = await this.findOne(id);

    if (classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
      });
      if (classEntity) {
        student.class = classEntity;
      } else {
        throw new NotFoundException(`Class with ID ${classId} not found`);
      }
    }

    if (courses_family_id) {
      const coursesFamilyEntity = await this.coursesFamilyRepository.findOne({
        where: { course_family_id: courses_family_id },
      });
      if (coursesFamilyEntity) {
        student.coursesFamily = coursesFamilyEntity;
      } else {
        throw new NotFoundException(
          `CoursesFamily with ID ${courses_family_id} not found`,
        );
      }
    }

    student.cardId = cardId;
    Object.assign(student, studentData, { studentId });

    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByClassId(classId: number): Promise<Student[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return await this.studentRepository.find({
      where: { class: { id: classId } },
      relations: ['class', 'attendances', 'coursesFamily', 'cohort'],
    });
  }

  async createStudentWithClass(createStudentDto: {
    classId: number;
    studentId: number[];
  }): Promise<Student[]> {
    const { classId, studentId } = createStudentDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const students = await this.studentRepository.findByIds(studentId);
    if (students.length === 0) {
      throw new NotFoundException(`No students found for the provided IDs`);
    }

    for (const student of students) {
      student.class = classEntity;
    }

    return this.studentRepository.save(students);
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<void> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    student.avatar = avatarUrl;
    await this.studentRepository.save(student);
  }

  async deleteAvatar(id: number): Promise<void> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.avatar) {
      try {
        const filePath = join(process.cwd(), student.avatar);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting avatar file:', error);
      }

      student.avatar = null;
      await this.studentRepository.save(student);
    }
  }

  async findStudentsByModule(moduleId: number): Promise<Student[]> {
    return await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.class', 'class')
      .innerJoin('class.schedules', 'schedule')
      .innerJoin('schedule.module', 'module')
      .leftJoin('student.grade', 'grade')
      .where('module.module_id = :moduleId', { moduleId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('grade.id IS NULL').orWhere('grade.status != :status', {
            status: 'PASSED',
          });
        }),
      )
      .getMany();
  }

  async findStudentByUserId(userId: number): Promise<Student> {
    return await this.studentRepository
      .createQueryBuilder('student')
      .where('student.userId = :userId', { userId })
      .getOne();
  }

  // Function to check if a student has passed a module
  async checkPass(
    moduleCode: string,
    studentId: number,
  ): Promise<{ classId: number; className: string }[] | null> {
    // Find the student by ID
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Find the module to verify it exists
    const module = await this.moduleRepository
      .createQueryBuilder('module')
      .where('module.code = :moduleCode', { moduleCode })
      .getOne();

    if (!module) {
      throw new NotFoundException(`Module with code ${moduleCode} not found`);
    }

    // Check if student has a pending resit registration
    const existingResit = await this.studentResitRepository.findOne({
      where: {
        studentId: studentId,
        moduleId: module.module_id,
        status: 'PENDING',
      },
    });

    if (existingResit) {
      throw new ConflictException(
        `Bạn đã đăng ký học lại môn ${moduleCode} và đang chờ xử lý`,
      );
    }

    // Find the grade for the student and module
    const gradeFinal = await this.gradeFinalRepository
      .createQueryBuilder('gradeFinal')
      .innerJoin('gradeFinal.module', 'module')
      .where('module.code = :moduleCode', { moduleCode })
      .andWhere('gradeFinal.student.id = :studentId', { studentId })
      .getOne();

    // Nếu không có điểm (chưa học) thì trả về null
    if (!gradeFinal) {
      return null;
    }

    // Nếu có điểm và status là PASSED thì throw error
    if (gradeFinal.status === 'PASSED') {
      throw new ConflictException(`Sinh viên đã qua môn ${moduleCode}`);
    }

    // Nếu có điểm và status là NOT PASSED thì cho đăng ký học lại
    if (gradeFinal.status === 'NOT PASSED') {
      const scheduledClasses = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .innerJoin('schedule.class', 'class')
        .innerJoin('schedule.module', 'module')
        .where('module.code = :moduleCode', { moduleCode })
        .andWhere('class.status = :status', { status: 'Đã lập lịch' })
        .select(['class.id', 'class.name'])
        .distinct(true)
        .getRawMany();

      return scheduledClasses.map((cls) => ({
        classId: cls.class_id,
        className: cls.class_name,
      }));
    }

    return null;
  }
}
