import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/entities/center/student.entity';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { StudentModuleGradeComponent } from 'src/entities/grades/student.module.gc.entity';
import { GradeFinal } from 'src/entities/grades/grades.entity';
import { In, Repository } from 'typeorm';
import {
  CreateGradeCategoryDto,
  UpdateGradeCategoryDto,
} from './dto/gradecategory.dto';
import { Module } from 'src/entities/module.entity';
import { GradeInputDto, GradeResponseDto } from './dto/gradecategory.dto';
import { GradeComponentStatus } from 'src/entities/enum/gradecomponent.enum';

@Injectable()
export class GradecategoryService {
  constructor(
    @InjectRepository(GradeCategory)
    private gradeCategoryRepository: Repository<GradeCategory>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentModuleGradeComponent)
    private studentModuleGradeComponentRepository: Repository<StudentModuleGradeComponent>,
    @InjectRepository(GradeComponent)
    private gradeComponentRepository: Repository<GradeComponent>,
    @InjectRepository(GradeFinal)
    private gradeFinalRepository: Repository<GradeFinal>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async create(data: CreateGradeCategoryDto): Promise<GradeCategory> {
    const gradeCategory = this.gradeCategoryRepository.create(data);
    return await this.gradeCategoryRepository.save(gradeCategory);
  }

  async findAll(): Promise<GradeCategory[]> {
    return await this.gradeCategoryRepository.find();
  }

  async findOne(id: number): Promise<GradeCategory> {
    const gradeCategory = await this.gradeCategoryRepository.findOne({
      where: { id },
    });
    if (!gradeCategory) {
      throw new NotFoundException(`Không tìm thấy hạng mục điểm với ID ${id}`);
    }
    return gradeCategory;
  }

  async update(
    id: number,
    data: UpdateGradeCategoryDto,
  ): Promise<GradeCategory> {
    await this.gradeCategoryRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.gradeCategoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy hạng mục điểm với ID ${id}`);
    }
  }

  async getStudentGrades(studentId: number, moduleId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy sinh viên với ID ${studentId}`,
      );
    }

    const gradeComponents = await this.gradeComponentRepository.find({
      where: { gradeCategory: { module: { module_id: moduleId } } },
      relations: ['gradeCategory', 'gradeCategory.module'],
    });

    if (gradeComponents.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy thành phần điểm cho module ${moduleId}`,
      );
    }

    const studentGrades = await this.studentModuleGradeComponentRepository.find(
      {
        where: {
          student: { id: studentId },
          gradeComponent: { id: In(gradeComponents.map((gc) => gc.id)) },
        },
        relations: [
          'gradeComponent',
          'gradeComponent.gradeCategory',
          'gradeComponent.gradeCategory.module',
        ],
      },
    );

    const finalGrade = await this.gradeFinalRepository.findOne({
      where: {
        student: { id: studentId },
        module: { module_id: moduleId },
      },
      relations: ['module'],
    });

    const gradeMap = new Map(
      studentGrades.map((grade) => [grade.gradeComponent.id, grade]),
    );

    const grades = gradeComponents.map((gradeComponent) => {
      const grade = gradeMap.get(gradeComponent.id);
      return {
        id: grade?.id || null,
        score: grade?.score || null,
        gradeComponent: {
          id: gradeComponent.id,
          name: gradeComponent.name,
          gradeCategory: {
            id: gradeComponent.gradeCategory.id,
            name: gradeComponent.gradeCategory.name,
            weight: gradeComponent.weight,
          },
        },
      };
    });

    const response = {
      student,
      module: gradeComponents[0].gradeCategory.module,
      grades,
      finalGrade: finalGrade
        ? {
            id: finalGrade.id,
            average_grade: finalGrade.average_grade,
            status: finalGrade.status,
            remarks: finalGrade.remarks,
          }
        : null,
    };

    return response;
  }

  async assignGradesForStudents(
    gradesData: GradeInputDto[],
  ): Promise<GradeResponseDto[]> {
    const results: GradeResponseDto[] = [];

    for (const gradeData of gradesData) {
      const {
        studentId,
        moduleId,
        gradeComponentId,
        score,
        average_grade,
        remarks,
      } = gradeData;

      try {
        const student = await this.studentRepository.findOne({
          where: { id: studentId },
        });

        if (!student) {
          throw new NotFoundException(`Student ${studentId} not found`);
        }

        if (gradeComponentId && score !== undefined) {
          const gradeComponent = await this.gradeComponentRepository.findOne({
            where: { id: gradeComponentId },
            relations: ['gradeCategory'],
          });

          if (!gradeComponent) {
            throw new NotFoundException(
              `GradeComponent ${gradeComponentId} not found`,
            );
          }

          let studentGrade =
            await this.studentModuleGradeComponentRepository.findOne({
              where: {
                student: { id: studentId },
                gradeComponent: { id: gradeComponentId },
              },
            });

          if (studentGrade) {
            studentGrade.score = score;
          } else {
            studentGrade = this.studentModuleGradeComponentRepository.create({
              student: { id: studentId },
              gradeComponent,
              score: score,
            });
          }

          await this.studentModuleGradeComponentRepository.save(studentGrade);
        }

        if (average_grade !== undefined) {
          let finalGrade = await this.gradeFinalRepository.findOne({
            where: {
              student: { id: studentId },
              module: { module_id: moduleId },
            },
          });

          const status = average_grade >= 5 ? 'PASSED' : 'NOT PASSED';
          const isResit = await this.hasResitComponents(studentId, moduleId);

          if (finalGrade) {
            finalGrade.attempt = isResit ? 2 : 1;
            finalGrade.average_grade = average_grade;
            finalGrade.status = status;
            finalGrade.remarks = remarks ?? null;

            // if (!isResit) {
            //   finalGrade.first_attempt_grade = average_grade;
            // }
          } else {
            finalGrade = this.gradeFinalRepository.create({
              student: { id: studentId },
              module: { module_id: moduleId },
              attempt: isResit ? 2 : 1,
              average_grade,
              status,
              remarks: remarks ?? null,
            });
          }

          await this.gradeFinalRepository.save(finalGrade);
        }

        const responseData: GradeResponseDto = {
          student: {
            id: student.id,
            name: student.name,
          },
          module: {
            module_id: moduleId,
            module_name:
              (
                await this.moduleRepository.findOne({
                  where: { module_id: moduleId },
                })
              )?.module_name || '',
          },
          grades: [],
          finalGrade: null,
        };

        results.push(responseData);
      } catch (error) {
        // ... error handling ...
      }
    }

    return results;
  }

  private async hasResitComponents(
    studentId: number,
    moduleId: number,
  ): Promise<boolean> {
    const studentGrades = await this.studentModuleGradeComponentRepository.find(
      {
        where: {
          student: { id: studentId },
          gradeComponent: {
            gradeCategory: {
              module: { module_id: moduleId },
            },
            status: GradeComponentStatus.RESIT,
          },
        },
        relations: ['gradeComponent'],
      },
    );

    return studentGrades.length > 0;
  }
}
