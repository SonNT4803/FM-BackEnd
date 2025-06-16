import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Application } from 'src/entities/admissions/application.entity';
import { ApplicationStatus } from 'src/entities/enum/application-status.enum';
import { ApplicationService } from './application.service';
import { CreateApplicationDTO } from './dto/application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  async getAll(@Query() filters: any): Promise<{
    statusCode: number;
    message: string;
    data?: Application[];
  }> {
    try {
      const applications = await this.applicationService.findAll(filters);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách đơn ứng tuyển thành công',
        data: applications,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách đơn ứng tuyển thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  async create(
    @Body() data: CreateApplicationDTO,
  ): Promise<{ statusCode: number; message: string; data?: Application }> {
    try {
      const application = await this.applicationService.createApplication(data);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo đơn ứng tuyển thành công',
        data: application,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo đơn ứng tuyển thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/:id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: Application }> {
    try {
      const application = await this.applicationService.getApplicationById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin đơn ứng tuyển thành công',
        data: application,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy đơn ứng tuyển',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('/addmission/:id')
  async findByAdmissionId(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: Application[] }> {
    try {
      const application =
        await this.applicationService.getApplicationByAdmissionId(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lọc đơn ứng tuyến',
        data: application,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy đơn ứng tuyến',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('/:id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Application>,
  ): Promise<{ statusCode: number; message: string; data?: Application }> {
    try {
      const updatedApplication =
        await this.applicationService.updateApplication(id, data);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật đơn ứng tuyển thành công',
        data: updatedApplication,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật đơn ứng tuyển thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('/:id/status')
  async changeStatus(
    @Param('id') id: number,
    @Body('status') status: ApplicationStatus,
    @Body('cohortName') cohortName: string,
  ): Promise<{ statusCode: number; message: string; data?: Application }> {
    try {
      const updatedApplication = await this.applicationService.changeStatus(
        id,
        status,
        cohortName,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
        data: updatedApplication,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật trạng thái đơn ứng tuyển thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('/status-multiple')
  async changeStatusMultiple(
    @Body('id') ids: number[],
    @Body('status') status: ApplicationStatus,
    @Body('cohortName') cohortName: string,
  ): Promise<{ statusCode: number; message: string; data?: Application[] }> {
    try {
      const updatedApplications =
        await this.applicationService.changeStatusSelectAll(
          ids,
          status,
          cohortName,
        );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật trạng thái cho các đơn ứng tuyển thành công',
        data: updatedApplications,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật trạng thái cho các đơn ứng tuyển thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
