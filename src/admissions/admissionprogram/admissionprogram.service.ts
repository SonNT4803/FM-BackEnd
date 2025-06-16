import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AProgramApplicationDocument } from 'src/entities/admissions/a.program_application.documents.entity';
import { ProgramPromotion } from 'src/entities/admissions/a.program_promotion.entity';
import { AdmissionProgram } from 'src/entities/admissions/admission.program.entity';
import { ApplicationDocument } from 'src/entities/admissions/application.documents.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  CreateAdmissionProgramDto,
  UpdateAdmissionProgramDto,
} from './dto/admissionprogram.dto';

@Injectable()
export class AdmissionprogramService {
  constructor(
    @InjectRepository(AdmissionProgram)
    private admissionProgramRepository: Repository<AdmissionProgram>,
    @InjectRepository(AProgramApplicationDocument)
    private admissionProgramApplicationDocumentRepository: Repository<AProgramApplicationDocument>,
    @InjectRepository(ApplicationDocument)
    private applicationDocumentRepository: Repository<ApplicationDocument>,
    @InjectRepository(ProgramPromotion)
    private programPromotionRepository: Repository<ProgramPromotion>,
  ) {}

  async create(
    createAdmissionProgramDto: CreateAdmissionProgramDto,
  ): Promise<CreateAdmissionProgramDto> {
    const { applicationDocuments, promotions, ...programData } =
      createAdmissionProgramDto;

    const newProgram = this.admissionProgramRepository.create(programData);
    const savedProgram = await this.admissionProgramRepository.save(newProgram);

    if (applicationDocuments && applicationDocuments.length > 0) {
      const documentRelations = applicationDocuments.map((document) => {
        return this.admissionProgramApplicationDocumentRepository.create({
          admissionProgram: savedProgram,
          applicationDocument: { id: document.id },
        });
      });
      await this.admissionProgramApplicationDocumentRepository.save(
        documentRelations,
      );
    }

    if (promotions && promotions.length > 0) {
      const promotionRelations = promotions.map((promotion) => {
        return this.programPromotionRepository.create({
          program: savedProgram,
          promotion: { id: promotion.id },
        });
      });
      await this.programPromotionRepository.save(promotionRelations);
    }

    return this.findOne(savedProgram.id);
  }

  async findAll(): Promise<CreateAdmissionProgramDto[]> {
    const programs = await this.admissionProgramRepository.find();
    let programDtos: CreateAdmissionProgramDto[] = [];
    for (const program of programs) {
      const admissionProgramPromotion =
        await this.programPromotionRepository.find({
          where: {
            program: { id: program.id },
          },
          relations: ['promotion'],
        });
      const admissionProgramApplicationDocuments =
        await this.admissionProgramApplicationDocumentRepository.find({
          where: {
            admissionProgram: { id: program.id },
          },
          relations: ['applicationDocument'],
        });

      const promotions = admissionProgramPromotion
        .map((promo) => promo.promotion)
        .filter((promo) => promo !== null)
        .map((promo) => ({
          id: promo.id,
          name: promo.name,
        }));

      const applicationDocuments = admissionProgramApplicationDocuments
        .map((doc) => doc.applicationDocument)
        .filter((doc) => doc !== null)
        .map((doc) => ({
          id: doc.id,
          name: doc.name,
        }));

      const programDto: CreateAdmissionProgramDto = {
        ...program,
        applicationDocuments,
        promotions,
      };
      programDtos.push(programDto);
    }
    return programDtos;
  }

  async findOne(id: number): Promise<CreateAdmissionProgramDto> {
    const program = await this.admissionProgramRepository.findOne({
      where: { id },
    });
    if (!program) {
      throw new NotFoundException('Không tìm thấy chương trình tuyển sinh');
    }

    const admissionProgramApplicationDocuments =
      await this.admissionProgramApplicationDocumentRepository.find({
        where: {
          admissionProgram: { id: program.id },
        },
        relations: ['applicationDocument'],
      });
    const applicationDocuments = admissionProgramApplicationDocuments
      .map((doc) => doc.applicationDocument)
      .filter((doc) => doc !== null)
      .map((doc) => ({
        id: doc.id,
        name: doc.name,
      }));

    const admissionProgramPromotion =
      await this.programPromotionRepository.find({
        where: {
          program: { id: program.id },
        },
        relations: ['promotion'],
      });

    const promotions = admissionProgramPromotion
      .map((promo) => promo.promotion)
      .filter((promo) => promo !== null)
      .map((promo) => ({
        id: promo.id,
        name: promo.name,
      }));

    const programDto: CreateAdmissionProgramDto = {
      ...program,
      applicationDocuments,
      promotions,
    };

    return programDto;
  }

  async updateDocumentInApplicationProgram(
    admissionProgramId: number,
    applicationDocumentIds: number[],
  ): Promise<AdmissionProgram> {
    const admissionProgram = await this.findOne(admissionProgramId);
    const applicationDocuments =
      await this.applicationDocumentRepository.findByIds(
        applicationDocumentIds,
      );

    await this.admissionProgramApplicationDocumentRepository.delete({
      admissionProgram: { id: admissionProgramId },
    });

    const relations = applicationDocuments.map((document) => {
      return this.admissionProgramApplicationDocumentRepository.create({
        admissionProgram: admissionProgram,
        applicationDocument: {
          id: document.id,
          name: document.name,
        } as ApplicationDocument,
      });
    });

    admissionProgram.applicationDocuments = applicationDocuments;
    await this.admissionProgramApplicationDocumentRepository.save(relations);
    return await this.admissionProgramRepository.save(admissionProgram);
  }

  async update(
    id: number,
    updateAdmissionProgramDto: UpdateAdmissionProgramDto,
  ): Promise<CreateAdmissionProgramDto> {
    const { applicationDocuments, promotions, ...programData } =
      updateAdmissionProgramDto;

    // Kiểm tra và lấy chương trình hiện tại
    const currentProgram = await this.findOne(id);
    if (!currentProgram) {
      throw new NotFoundException('Không tìm thấy chương trình tuyển sinh');
    }

    const updatedProgram = await this.admissionProgramRepository.save({
      ...currentProgram,
      ...programData,
    });

    if (applicationDocuments) {
      await this.admissionProgramApplicationDocumentRepository.delete({
        admissionProgram: { id: updatedProgram.id },
      });

      if (applicationDocuments.length > 0) {
        const documentRelations = applicationDocuments.map((document) => {
          return this.admissionProgramApplicationDocumentRepository.create({
            admissionProgram: updatedProgram,
            applicationDocument: { id: document.id },
          });
        });
        await this.admissionProgramApplicationDocumentRepository.save(
          documentRelations,
        );
      }
    }

    if (promotions) {
      await this.programPromotionRepository.delete({
        program: { id: updatedProgram.id },
      });

      if (promotions.length > 0) {
        const promotionRelations = promotions.map((promotion) => {
          return this.programPromotionRepository.create({
            program: updatedProgram,
            promotion: { id: promotion.id },
          });
        });
        await this.programPromotionRepository.save(promotionRelations);
      }
    }

    return this.findOne(updatedProgram.id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.admissionProgramRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        'Không tìm thấy chương trình tuyển sinh để xóa',
      );
    }
  }

  async findProgramByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AdmissionProgram | null> {
    return await this.admissionProgramRepository.findOne({
      where: {
        startDate: LessThanOrEqual(startDate),
        endDate: MoreThanOrEqual(endDate),
      },
    });
  }
}
