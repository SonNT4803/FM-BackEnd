import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDocument } from 'src/entities/admissions/application.documents.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationdocumentsService {
  constructor(
    @InjectRepository(ApplicationDocument)
    private readonly applicationDocumentRepository: Repository<ApplicationDocument>,
  ) {}

  async create(name: string): Promise<ApplicationDocument> {
    const newDocument = this.applicationDocumentRepository.create({ name });
    return await this.applicationDocumentRepository.save(newDocument);
  }

  async findAll(): Promise<ApplicationDocument[]> {
    return await this.applicationDocumentRepository.find();
  }

  async findOne(id: number): Promise<ApplicationDocument> {
    const document = await this.applicationDocumentRepository.findOne({
      where: { id },
    });
    if (!document) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }
    return document;
  }

  async update(id: number, name: string): Promise<ApplicationDocument> {
    const document = await this.findOne(id);
    document.name = name;
    return await this.applicationDocumentRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.applicationDocumentRepository.remove(document);
  }
}
