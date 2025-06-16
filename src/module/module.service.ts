import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { ExamType } from 'src/entities/center/exam.type.entity';
import { ExamTypeModule } from 'src/entities/center/exam.type.module.entity';
import { GradeComponentStatus } from 'src/entities/enum/gradecomponent.enum';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { Module } from 'src/entities/module.entity';
import { Repository } from 'typeorm';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(GradeCategory)
    private readonly gradeCategoryRepository: Repository<GradeCategory>,
    @InjectRepository(GradeComponent)
    private readonly gradeComponentRepository: Repository<GradeComponent>,
    @InjectRepository(ExamTypeModule)
    private readonly examTypeModuleRepository: Repository<ExamTypeModule>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const { gradeCategories, exam_type, semester_id, ...moduleData } =
      createModuleDto;
    const newModule = this.moduleRepository.create({
      ...moduleData,
      semester: { id: semester_id },
    });
    const savedModule = await this.moduleRepository.save(newModule);

    if (gradeCategories) {
      for (const category of gradeCategories) {
        let categoryWeight = 0;
        if (category.gradeComponents) {
          categoryWeight = category.gradeComponents.reduce(
            (sum, component) => sum + (component.weight || 0),
            0,
          );
        }

        const gradeCategory = this.gradeCategoryRepository.create({
          name: category.name,
          module: savedModule,
          weight: categoryWeight,
        });
        const savedGradeCategory =
          await this.gradeCategoryRepository.save(gradeCategory);

        if (category.gradeComponents) {
          for (const component of category.gradeComponents) {
            const gradeComponent = this.gradeComponentRepository.create({
              name: component.name,
              gradeCategory: savedGradeCategory,
              weight: component.weight,
              status: component.status || GradeComponentStatus.REGULAR,
            });
            await this.gradeComponentRepository.save(gradeComponent);
          }
        }
      }
    }

    if (exam_type && exam_type.length > 0) {
      for (const examTypeId of exam_type) {
        const examTypeModule = this.examTypeModuleRepository.create({
          exam_type_id: examTypeId,
          module_id: savedModule.module_id,
        });
        await this.examTypeModuleRepository.save(examTypeModule);
      }
    }

    return savedModule;
  }

  async findAll(): Promise<Module[]> {
    const modules = await this.moduleRepository.find({
      relations: [
        'gradeCategories',
        'gradeCategories.gradeComponents',
        'semester',
      ],
    });

    for (const module of modules) {
      const examTypeModules = await this.examTypeModuleRepository.find({
        where: { module_id: module.module_id },
      });

      const examTypes = await Promise.all(
        examTypeModules.map(async (examTypeModule) => {
          return await this.examTypeModuleRepository.manager
            .getRepository(ExamType)
            .findOne({
              where: { id: examTypeModule.exam_type_id },
            });
        }),
      );

      module['exam_type'] = examTypes;
    }

    return modules;
  }

  async getModuleByCode(code: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { code } });
    console.log(code);
    if (!module) {
      throw new NotFoundException(`Module with code ${code} not found`);
    }
    return module;
  }

  async findOne(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { module_id: id },
      relations: [
        'gradeCategories',
        'gradeCategories.gradeComponents',
        'semester',
      ],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    const examTypeModules = await this.examTypeModuleRepository.find({
      where: { module_id: id },
    });

    const examTypes = await Promise.all(
      examTypeModules.map(async (examTypeModule) => {
        return await this.examTypeModuleRepository.manager
          .getRepository(ExamType)
          .findOne({
            where: { id: examTypeModule.exam_type_id },
          });
      }),
    );

    module['exam_type'] = examTypes;

    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { module_id: id },
      relations: ['gradeCategories', 'gradeCategories.gradeComponents'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    const { gradeCategories, exam_type, semester_id, ...moduleData } =
      updateModuleDto;

    Object.assign(module, {
      ...moduleData,
      semester: { id: semester_id },
    });
    await this.moduleRepository.save(module);

    // Lấy danh sách category hiện tại
    const existingCategories = await this.gradeCategoryRepository.find({
      where: { module: { module_id: id } },
      relations: ['gradeComponents'],
    });

    if (gradeCategories) {
      // Tạo map các category ID được gửi lên để dễ kiểm tra
      const updatedCategoryIds = new Set(
        gradeCategories.filter((cat) => cat.id).map((cat) => cat.id),
      );

      // Xóa các category không còn trong danh sách update
      for (const existingCategory of existingCategories) {
        if (!updatedCategoryIds.has(existingCategory.id)) {
          // Xóa tất cả components của category này
          for (const component of existingCategory.gradeComponents) {
            await this.gradeComponentRepository.remove(component);
          }
          await this.gradeCategoryRepository.remove(existingCategory);
        }
      }

      // Cập nhật hoặc tạo mới categories
      for (const categoryDto of gradeCategories) {
        let category;

        if (categoryDto.id) {
          category = await this.gradeCategoryRepository.findOne({
            where: { id: categoryDto.id },
            relations: ['gradeComponents'],
          });

          if (category) {
            // Tạo map các component ID được gửi lên
            const updatedComponentIds = new Set(
              categoryDto.gradeComponents
                ?.filter((comp) => comp.id)
                .map((comp) => comp.id) || [],
            );

            // Xóa các component không còn trong danh sách update
            for (const existingComponent of category.gradeComponents) {
              if (!updatedComponentIds.has(existingComponent.id)) {
                await this.gradeComponentRepository.remove(existingComponent);
              }
            }

            // Cập nhật category
            category.name = categoryDto.name;
            let categoryWeight = 0;
            if (categoryDto.gradeComponents) {
              categoryWeight = categoryDto.gradeComponents.reduce(
                (sum, component) => sum + (component.weight || 0),
                0,
              );
            }
            category.weight = categoryWeight;
            category = await this.gradeCategoryRepository.save(category);
          }
        } else {
          category = this.gradeCategoryRepository.create({
            name: categoryDto.name,
            module: module,
          });
          category = await this.gradeCategoryRepository.save(category);
        }

        if (categoryDto.gradeComponents && category) {
          for (const componentDto of categoryDto.gradeComponents) {
            if (componentDto.id) {
              const existingComponent =
                await this.gradeComponentRepository.findOne({
                  where: { id: componentDto.id },
                });
              if (existingComponent) {
                existingComponent.name = componentDto.name;
                existingComponent.weight = componentDto.weight;
                existingComponent.status =
                  componentDto.status || GradeComponentStatus.REGULAR;
                await this.gradeComponentRepository.save(existingComponent);
              }
            } else {
              const newComponent = this.gradeComponentRepository.create({
                name: componentDto.name,
                weight: componentDto.weight,
                status: componentDto.status || GradeComponentStatus.REGULAR,
                gradeCategory: category,
              });
              await this.gradeComponentRepository.save(newComponent);
            }
          }
        }
      }
    } else {
      // Nếu không có gradeCategories được gửi lên, xóa tất cả categories hiện có
      for (const existingCategory of existingCategories) {
        for (const component of existingCategory.gradeComponents) {
          await this.gradeComponentRepository.remove(component);
        }
        await this.gradeCategoryRepository.remove(existingCategory);
      }
    }

    if (exam_type) {
      await this.examTypeModuleRepository.delete({ module_id: id });
      for (const examTypeId of exam_type) {
        const examTypeModule = this.examTypeModuleRepository.create({
          exam_type_id: examTypeId,
          module_id: id,
        });
        await this.examTypeModuleRepository.save(examTypeModule);
      }
    }

    return this.moduleRepository.findOne({
      where: { module_id: id },
      relations: ['gradeCategories', 'gradeCategories.gradeComponents'],
    });
  }

  async remove(id: number): Promise<void> {
    const module = await this.moduleRepository.findOne({
      where: { module_id: id },
      relations: ['gradeCategories'],
    });

    if (!module) {
      throw new NotFoundException('Module not found to delete');
    }

    for (const gradeCategory of module.gradeCategories) {
      const gradeComponents = await this.gradeComponentRepository.find({
        where: { gradeCategory: gradeCategory },
      });

      for (const gradeComponent of gradeComponents) {
        await this.gradeComponentRepository.remove(gradeComponent);
      }

      await this.gradeCategoryRepository.remove(gradeCategory);
    }

    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Module not found to delete');
    }
  }

  async getModulesByClassAndTerm(
    classId: number,
    termNumber: number,
  ): Promise<Module[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['coursesFamily'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const coursesFamily = classEntity.coursesFamily;

    if (!coursesFamily) {
      throw new NotFoundException(
        `No CoursesFamily found for Class ID ${classId}`,
      );
    }

    const modules = await this.moduleRepository.find({
      where: {
        courses: {
          course_families: { course_family_id: coursesFamily.course_family_id },
        },
        semester: { term_number: termNumber },
      },
      relations: ['gradeCategories', 'gradeCategories.gradeComponents'],
    });

    for (const module of modules) {
      module['class'] = classEntity;
    }

    return modules;
  }
}
