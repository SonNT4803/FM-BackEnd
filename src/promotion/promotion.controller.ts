import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { PromotionService } from "./promotion.service";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { Promotion } from "src/entities/admissions/promotion.entity";

@Controller("promotions")
export class PromotionController {
    constructor(
        private readonly promotionService: PromotionService
    ) { }


    @Post()
    async create(
        @Body() createPromotionDto: CreatePromotionDto
    ): Promise<{ statusCode: number; message: string; data?: Promotion }> {
        try {
            const promotion = await this.promotionService.create(createPromotionDto);
            return {
                statusCode: HttpStatus.CREATED,
                message: 'Tạo thành công',
                data: promotion,
            };
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Tạo không thành công',
                    error: error.message,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get()
    async findAll(): Promise<{ statusCode: number; message: string; data?: Promotion[] }> {
        try {
            const allPromotion = await this.promotionService.findAll();
            return {
                statusCode: HttpStatus.OK,
                message: 'Ok',
                data: allPromotion,
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Không tìm thấy',
                    error: error.message,
                },
                HttpStatus.NOT_FOUND
            );
        }
    }

    @Get("/:id")
    async findOne(
        @Param("id") id: number
    ): Promise<{ statusCode: number; message: string; data?: Promotion }> {
        try {
            const promotion = await this.promotionService.findOne(id);
            return {
                statusCode: HttpStatus.OK,
                message: "OK",
                data: promotion
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Không tìm thấy',
                    error: error.message
                },
                HttpStatus.NOT_FOUND
            );
        }
    }

    @Put("/:id")
    async update(
        @Param("id") id: number,
        @Body() updatePromotionDto: UpdatePromotionDto
    ): Promise<{ statusCode: number; message: string; data?: Promotion }> {
        try {
            const updatedPromotion = await this.promotionService.update(id, updatePromotionDto);
            return {
                statusCode: HttpStatus.OK,
                message: "Updated",
                data: updatedPromotion
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Lỗi khi edit",
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<{ statusCode: number; message: string }> {
        try {
            await this.promotionService.remove(id);
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
                HttpStatus.NOT_FOUND
            );
        }
    }


}