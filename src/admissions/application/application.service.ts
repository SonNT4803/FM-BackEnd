import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdmissionProgram } from 'src/entities/admissions/admission.program.entity';
import { Application } from 'src/entities/admissions/application.entity';
import { IntensiveCare } from 'src/entities/admissions/intensive.care.entity';
import { PriorityIntensiveCare } from 'src/entities/admissions/priority.intensive.care.entity';
import { Cohort } from 'src/entities/center/cohort.entity';
import { Student } from 'src/entities/center/student.entity';
import { StudentProfile } from 'src/entities/center/student.profile.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { ApplicationStatus } from 'src/entities/enum/application-status.enum';
import { Parent } from 'src/entities/parent.entity';
import { In, Not, Repository, FindManyOptions, Like } from 'typeorm';
import { CreateApplicationDTO } from './dto/application.dto';
import { Priority } from 'src/entities/admissions/priority.entity';

interface ApplicationWithProfile extends Application {
  latestStudentProfile?: StudentProfile;
}

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(AdmissionProgram)
    private admissionRepository: Repository<AdmissionProgram>,
    @InjectRepository(CoursesFamily)
    private courseFamilyRespository: Repository<CoursesFamily>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(PriorityIntensiveCare)
    private priorityIntensiveCareRepository: Repository<PriorityIntensiveCare>,
    @InjectRepository(IntensiveCare)
    private intensiveCareRepository: Repository<IntensiveCare>,
    @InjectRepository(Priority)
    private priorityRepository: Repository<Priority>,
  ) {}

  async findAll(filters: any): Promise<Application[]> {
    const options: FindManyOptions<Application> = {
      relations: [
        'coursesFamily',
        'admissionProgram',
        'parent',
        'studentProfile',
        'intensiveCare',
        'attachedDocuments',
        'student',
      ],
      where: {},
    };

    if (filters.name) {
      options.where['name'] = Like(`%${filters.name}%`);
    }

    if (filters.status) {
      options.where['status'] = filters.status;
    }

    if (filters.admissionProgramId) {
      options.where['admissionProgram'] = { id: filters.admissionProgramId };
    }

    return await this.applicationRepository.find(options);
  }

  async createApplication(
    data: CreateApplicationDTO,
  ): Promise<ApplicationWithProfile> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { cardId: data.cardId },
    });
    if (existingApplication) {
      throw new BadRequestException(`Card ID ${data.cardId} đã tồn tại`);
    }

    const admissionProgram = await this.admissionRepository.findOne({
      where: { id: data.admissionProgramId },
    });

    const courseFamily = await this.courseFamilyRespository.findOne({
      where: { course_family_id: data.courses_family_id },
    });

    const parents = await this.parentRepository.find({
      where: {},
      order: { id: 'DESC' },
    });

    const studentProfile = await this.studentProfileRepository.findOne({
      where: { id: data.studentProfileId },
      order: { id: 'DESC' },
    });

    const application = this.applicationRepository.create({
      ...data,
      admissionProgram: admissionProgram,
      coursesFamily: courseFamily,
      studentProfile: studentProfile,
      parent: parents,
    });

    const savedApplication = await this.applicationRepository.save(application);

    if (data.tick) {
      for (const intensiveCareData of data.intensiveCareList) {
        const intensiveCare = this.intensiveCareRepository.create({
          ...intensiveCareData,
          application: savedApplication,
        });
        const savedIntensiveCare =
          await this.intensiveCareRepository.save(intensiveCare);

        const priorityIntensiveCare =
          this.priorityIntensiveCareRepository.create({
            priorityId: intensiveCareData.priorityId,
            intensiveCareId: savedIntensiveCare.id,
          });
        await this.priorityIntensiveCareRepository.save(priorityIntensiveCare);
      }
    }

    studentProfile.application = savedApplication;
    await this.studentProfileRepository.save(studentProfile);

    return savedApplication;
  }

  async getApplicationByAdmissionId(
    admissionProgramId: number,
  ): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: {
        admissionProgram: { id: admissionProgramId },
        status: Not(ApplicationStatus.ENROLLED),
      },
      relations: ['admissionProgram', 'coursesFamily'],
    });
  }

  async getApplicationById(id: number): Promise<Application | undefined> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: [
        'coursesFamily',
        'admissionProgram',
        'parent',
        'studentProfile',
        'intensiveCare',
        'attachedDocuments',
        'student',
      ],
    });

    if (!application) {
      return undefined;
    }

    const intensiveCareRecords = await this.intensiveCareRepository.find({
      where: { application: { id } },
    });

    for (const intensiveCare of intensiveCareRecords) {
      const priorityIntensiveCare =
        await this.priorityIntensiveCareRepository.findOne({
          where: { intensiveCareId: intensiveCare.id },
        });

      if (priorityIntensiveCare) {
        const priority = await this.priorityRepository.findOne({
          where: { id: priorityIntensiveCare.priorityId },
        });

        if (priority) {
          intensiveCare['priority'] = priority;
        }
      }
    }

    application.intensiveCare = intensiveCareRecords;

    return application;
  }

  async updateApplication(
    id: number,
    data: any,
  ): Promise<Application | undefined> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { id },
      relations: [
        'coursesFamily',
        'parent',
        'intensiveCare',
        'attachedDocuments',
      ],
    });

    if (!existingApplication) {
      throw new BadRequestException(`Application with ID ${id} not found`);
    }

    if (data.cardId && data.cardId !== existingApplication.cardId) {
      const duplicateCard = await this.applicationRepository.findOne({
        where: { cardId: data.cardId, id: Not(id) },
      });
      if (duplicateCard) {
        throw new BadRequestException(`Card ID ${data.cardId} đã tồn tại`);
      }
    }

    existingApplication.name = data.name;
    existingApplication.email = data.email;
    existingApplication.gender = data.gender;
    existingApplication.birthdate = data.birthdate;
    existingApplication.phone = data.phone;
    existingApplication.cardId = data.cardId;
    existingApplication.permanentResidence = data.permanentResidence;

    if (data.course_family_id) {
      const courseFamily = await this.courseFamilyRespository.findOne({
        where: { course_family_id: data.course_family_id },
      });
      if (courseFamily) {
        existingApplication.coursesFamily = courseFamily;
      }
    }

    if (data.parent && data.parent.length > 0) {
      await this.parentRepository.delete({
        application: { id: existingApplication.id },
      });

      const newParents = data.parent.map((parentData) =>
        this.parentRepository.create({
          ...parentData,
          application: existingApplication,
        }),
      );
      existingApplication.parent = await this.parentRepository.save(newParents);
    }

    if (data.intensiveCare) {
      const existingIntensiveCares = await this.intensiveCareRepository.find({
        where: { application: { id: existingApplication.id } },
      });

      const existingIntensiveCareIds = existingIntensiveCares.map(
        (ic) => ic.id,
      );

      await this.priorityIntensiveCareRepository.delete({
        intensiveCareId: In(existingIntensiveCareIds),
      });

      await this.intensiveCareRepository.delete({
        application: { id: existingApplication.id },
      });

      const newIntensiveCares = [];
      for (const careData of data.intensiveCare) {
        const priority = await this.priorityRepository.findOne({
          where: { name: careData.priority.name },
        });

        if (priority) {
          const intensiveCare = await this.intensiveCareRepository.save(
            this.intensiveCareRepository.create({
              description: careData.description,
              application: existingApplication,
            }),
          );

          await this.priorityIntensiveCareRepository.save(
            this.priorityIntensiveCareRepository.create({
              priorityId: priority.id,
              intensiveCareId: intensiveCare.id,
            }),
          );

          newIntensiveCares.push(intensiveCare);
        }
      }
      existingApplication.intensiveCare = newIntensiveCares;
    }

    await this.applicationRepository.save(existingApplication);

    return this.getApplicationById(id);
  }

  async changeStatusSelectAll(
    id: number[],
    newStatus: ApplicationStatus,
    cohortName: string,
  ): Promise<Application[] | undefined> {
    const applications: Application[] = [];

    for (const i of id) {
      const application = await this.getApplicationById(i);
      if (!application) {
        continue;
      }
      application.status = newStatus;
      await this.applicationRepository.save(application);
      applications.push(application);

      if (newStatus === ApplicationStatus.ENROLLED) {
        await this.transferApplicationToStudent(i, cohortName);
      }
    }

    return applications.length > 0 ? applications : undefined;
  }

  async changeStatus(
    id: number,
    newStatus: ApplicationStatus,
    cohortName: string,
  ): Promise<Application | undefined> {
    const application = await this.getApplicationById(id);
    if (!application) {
      return undefined;
    }
    application.status = newStatus;
    await this.applicationRepository.save(application);
    if (newStatus === ApplicationStatus.ENROLLED) {
      await this.transferApplicationToStudent(id, cohortName);
    }
    return application;
  }

  async transferApplicationToStudent(
    applicationId: number,
    cohortName: string,
  ): Promise<Student[]> {
    const students: Student[] = [];

    const application = await this.getApplicationById(applicationId);
    if (!application || application.status !== ApplicationStatus.ENROLLED) {
      return [];
    }

    const cohort = await this.cohortRepository.findOne({
      where: { name: cohortName },
    });

    const savedStudent = await this.studentRepository.save({
      studentId: null, // You can update this if you have logic for generating the studentId
      name: application.name,
      email: application.email,
      gender: application.gender,
      birthdate: application.birthdate,
      phone: application.phone,
      class: null, // You can assign the class if needed
      coursesFamily: application.coursesFamily,
      application: application,
      permanentResidence: application.permanentResidence,
      cohort: cohort,
      parent: application.parent,
      cardId: application.cardId,
    });

    students.push(savedStudent);

    const intensiveCareRecords = await this.intensiveCareRepository.find({
      where: { application: { id: applicationId } },
    });

    for (const record of intensiveCareRecords) {
      record.student = savedStudent;
      await this.intensiveCareRepository.save(record);
    }

    return students;
  }
}
