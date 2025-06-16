import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttacheddocumentsService } from './attacheddocuments.service';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AttachedDocumentsDto } from './dto/attacheddocuments.dto';
import * as archiver from 'archiver';
import { AttachedDocuments } from 'src/entities/admissions/attached.documents.entity';

@Controller('attacheddocuments')
export class AttacheddocumentsController {
  constructor(
    private readonly attachedDocumentsService: AttacheddocumentsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() document: Partial<AttachedDocumentsDto>,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!document.applicationId) {
      throw new BadRequestException('ApplicationId is required');
    }

    document.filePath = `uploads/${file.filename}`;

    const newDocument = await this.attachedDocumentsService.create(
      document,
      document.applicationId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo tài liệu thành công',
      data: newDocument,
    };
  }

  @Get()
  async findAll() {
    const documents = await this.attachedDocumentsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách tài liệu thành công',
      data: documents,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const document = await this.attachedDocumentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy tài liệu thành công',
      data: document,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() document: Partial<AttachedDocuments>,
  ) {
    const updatedDocument = await this.attachedDocumentsService.update(
      id,
      document,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tài liệu thành công',
      data: updatedDocument,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.attachedDocumentsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa tài liệu thành công',
    };
  }

  @Get('view/:applicationId')
  async viewFileByApplicationId(
    @Param('applicationId') applicationId: number,
    @Res() res: Response,
  ) {
    const document =
      await this.attachedDocumentsService.findByApplicationId(applicationId);

    if (!document || !document.filePath) {
      throw new NotFoundException('File not found');
    }

    const filePath = path.join(__dirname, '..', '..', document.filePath);
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      throw new NotFoundException('File not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  }

  @Get('download/:applicationId')
  async downloadFilesByApplicationId(
    @Param('applicationId') applicationId: number,
    @Res() res: Response,
  ) {
    const documents =
      await this.attachedDocumentsService.findAllByApplicationId(applicationId);

    if (!documents || documents.length === 0) {
      throw new NotFoundException('No files found for this application ID');
    }

    const zipFileName = `document_${applicationId}.zip`;

    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    documents.forEach((document) => {
      const filePath = path.join(__dirname, '..', '..', document.filePath);
      const fileExists = fs.existsSync(filePath);

      if (fileExists) {
        archive.file(filePath, { name: path.basename(filePath) });
      }
    });

    await archive.finalize();
  }
}
