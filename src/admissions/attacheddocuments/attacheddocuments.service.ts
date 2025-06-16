import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/entities/admissions/application.entity';
import { AttachedDocuments } from 'src/entities/admissions/attached.documents.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AttacheddocumentsService {
  constructor(
    @InjectRepository(AttachedDocuments)
    private attachedDocumentsRepository: Repository<AttachedDocuments>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(
    document: Partial<AttachedDocuments>,
    applicationId: number,
  ): Promise<AttachedDocuments> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException(
        `Application với ID ${applicationId} không tồn tại`,
      );
    }

    const newDocument = this.attachedDocumentsRepository.create({
      ...document,
      application: application,
    });
    return await this.attachedDocumentsRepository.save(newDocument);
  }

  findAll(): Promise<AttachedDocuments[]> {
    return this.attachedDocumentsRepository.find();
  }

  async findOne(id: number): Promise<AttachedDocuments> {
    const document = await this.attachedDocumentsRepository.findOneBy({ id });
    if (!document) {
      throw new NotFoundException(`Không tìm thấy tài liệu với ID ${id}`);
    }
    return document;
  }

  async update(
    id: number,
    document: Partial<AttachedDocuments>,
  ): Promise<AttachedDocuments> {
    if (Object.keys(document).length === 0) {
      throw new Error('No update values provided');
    }
    await this.attachedDocumentsRepository.update(id, document);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.attachedDocumentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }

  async findByApplicationId(applicationId: number): Promise<AttachedDocuments> {
    const document = await this.attachedDocumentsRepository.findOne({
      where: { application: { id: applicationId } },
    });

    if (!document) {
      throw new NotFoundException(
        `Document for application ID ${applicationId} not found`,
      );
    }

    return document;
  }

  async findAllByApplicationId(
    applicationId: number,
  ): Promise<AttachedDocuments[]> {
    return await this.attachedDocumentsRepository.find({
      where: { application: { id: applicationId } },
    });
  }
}
