import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AdmissionprogramService } from './admissionprogram.service';
import {
  CreateAdmissionProgramDto,
  UpdateAdmissionProgramDto,
} from './dto/admissionprogram.dto';
import { UpdateApplicationDocumentDto } from '../applicationdocuments/dto/applicationdocuments.dto';

@Controller('admission-program')
export class AdmissionprogramController {
  constructor(
    private readonly admissionprogramService: AdmissionprogramService,
  ) {}

  @Post()
  async create(@Body() createAdmissionProgramDto: CreateAdmissionProgramDto) {
    const program = await this.admissionprogramService.create(
      createAdmissionProgramDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo chương trình tuyển sinh thành công',
      data: program,
    };
  }

  @Get()
  async findAll() {
    const programs = await this.admissionprogramService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách chương trình tuyển sinh thành công',
      data: programs,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const program = await this.admissionprogramService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin chương trình tuyển sinh thành công',
      data: program,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdmissionProgramDto: UpdateAdmissionProgramDto,
  ) {
    const program = await this.admissionprogramService.update(
      +id,
      updateAdmissionProgramDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật chương trình tuyển sinh thành công',
      data: program,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.admissionprogramService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa chương trình tuyển sinh thành công',
    };
  }

  @Get('by-date-range/:startDate/:endDate')
  async findProgramByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ) {
    const program = await this.admissionprogramService.findProgramByDateRange(
      startDate,
      endDate,
    );

    if (program) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Tìm thấy chương trình tuyển sinh phù hợp',
        data: program,
      };
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message:
          'Không tìm thấy chương trình tuyển sinh phù hợp trong khoảng thời gian này',
        data: null,
      };
    }
  }

  @Put(':id/documents')
  async updateDocumentInApplicationProgram(
    @Param('id') admissionProgramId: string,
    @Body() updateDocumentDto: UpdateApplicationDocumentDto,
  ) {
    const program =
      await this.admissionprogramService.updateDocumentInApplicationProgram(
        +admissionProgramId,
        updateDocumentDto.applicationDocumentIds,
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tài liệu trong chương trình tuyển sinh thành công',
      data: program,
    };
  }
}
