import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { UploadService } from './upload.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('excel')
@ApiTags('Excel')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const allData = {};
      for (const sheetName of workbook.SheetNames) {
        allData[sheetName] = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetName],
          { defval: '' },
        );
      }
      await this.uploadService.importMultiSheet(allData);
      return {
        statusCode: HttpStatus.OK,
        message: 'File uploaded successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error processing the file:', error);
      throw new HttpException(
        'Error processing the file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private convertRowsToColumns(data: any[][]): { [key: string]: any[] } {
    // Đảm bảo dữ liệu không rỗng
    if (!data || data.length === 0) return {};

    // Lấy số lượng cột từ hàng đầu tiên
    const numColumns = data[0].length;

    // Khởi tạo mảng cho từng cột
    const columns = Array.from({ length: numColumns }, () => []);

    // Duyệt qua từng hàng và phân bổ giá trị vào các cột tương ứng
    data.forEach((row) => {
      row.forEach((value, index) => {
        columns[index].push(value);
      });
    });

    // Chuyển đổi mảng cột thành đối tượng với tên cột làm key
    const result: { [key: string]: any[] } = {};
    columns.forEach((column, index) => {
      result[`Column${index + 1}`] = column;
    });

    return result;
  }
}
