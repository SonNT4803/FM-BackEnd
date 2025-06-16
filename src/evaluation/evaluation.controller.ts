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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('/multiple')
  async createMultiple(@Body() body: { evaluations: CreateEvaluationDto[] }) {
    if (!body.evaluations || !Array.isArray(body.evaluations)) {
      throw new Error('Invalid input: evaluations must be an array');
    }
    const result = await this.evaluationService.createMultiple(
      body.evaluations,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo đánh giá thành công',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const evaluations = await this.evaluationService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách đánh giá thành công',
      data: evaluations,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const evaluation = await this.evaluationService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin đánh giá thành công',
      data: evaluation,
    };
  }

  @Get('class/:classId')
  async getEvaluationsByClass(@Param('classId') classId: string) {
    const evaluations =
      await this.evaluationService.getEvaluationsByClass(+classId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách đánh giá theo lớp thành công',
      data: evaluations,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.evaluationService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa đánh giá thành công',
    };
  }
}
