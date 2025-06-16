import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { Promotion } from "src/entities/admissions/promotion.entity";

@Injectable()
export class PromotionService {

    constructor(
        @InjectRepository(Promotion)
        private readonly promotionRepository: Repository<Promotion>
    ) { }

    async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
        const promotion = this.promotionRepository.create(createPromotionDto);
        return await this.promotionRepository.save(promotion);
    }

    async findAll(): Promise<Promotion[]> {
        return await this.promotionRepository.find();
    }

    async findOne(id: number): Promise<Promotion> {
        const promotion = await this.promotionRepository.findOne({
            where: { id: id }
        });
        if (!promotion) {
            throw new Error('Không tìm thấy với id: ' + id)
        }
        return promotion
    }


    async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
        const promotion = await this.promotionRepository.findOne({
            where: { id: id }
        });
        if (!promotion) {
            throw new Error("Không tìm thấy với id: " + id)
        }
        Object.assign(promotion, updatePromotionDto);
        await this.promotionRepository.save(promotion);
        return promotion;
    }

    async remove(id: number): Promise<void> {
        const promotion = await this.promotionRepository.findOne({ where: { id } });
        if (!promotion) {
            throw new Error('Không tìm thấy promotion với id: ' + id);
        }
        await this.promotionRepository.delete(id);
    }


}