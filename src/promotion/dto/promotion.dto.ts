import { IsDateString, IsInt, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePromotionDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @MaxLength(500)
    description: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    @MaxLength(255)
    discountType: string; //sẽ sửa thành khoá ngoại trong entity

    @IsNumber({ maxDecimalPlaces: 2 })
    discount: number;

    @IsInt()
    scholarshipQuantity: number;

    @IsString()
    @MaxLength(500)
    condition: string;

    @IsInt()
    maxQuantity: number;

    @IsString()
    @MaxLength(255)
    registrationMethod: string;

    @IsString()
    @MaxLength(500)
    requiredDocument: string;
}

export class UpdatePromotionDto {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    discountType?: string;
    discount?: number;
    scholarshipQuantity?: number;
    condition?: string;
    maxQuantity?: number;
    registrationMethod?: string;
    requiredDocument?: string;
}
