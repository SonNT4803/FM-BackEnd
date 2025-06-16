import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CohortService } from './cohort.service';
import { Cohort } from 'src/entities/center/cohort.entity';

@Controller('cohorts')
export class CohortController {
  constructor(private readonly cohortService: CohortService) {}

  @Post()
  async create(
    @Body() createCohortDto: Cohort,
  ): Promise<{ statusCode: number; message: string; data?: Cohort }> {
    try {
      const cohort = await this.cohortService.create(createCohortDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo thành công',
        data: cohort,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo không thành công',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(): Promise<{
    statusCode: number;
    message: string;
    data?: Cohort[];
  }> {
    try {
      const allCohorts = await this.cohortService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Ok',
        data: allCohorts,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('/:id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: Cohort }> {
    try {
      const cohort = await this.cohortService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: cohort,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('/:id')
  async update(
    @Param('id') id: number,
    @Body() updateCohortDto: Cohort,
  ): Promise<{ statusCode: number; message: string; data?: Cohort }> {
    try {
      const updatedCohort = await this.cohortService.update(
        id,
        updateCohortDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Updated',
        data: updatedCohort,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lỗi khi edit',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/:id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      await this.cohortService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy với id: ' + id,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
