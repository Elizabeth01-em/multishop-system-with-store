/* eslint-disable prettier/prettier */
// src/shops/shops.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';
import { CreateShopDto } from '../auth/dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
  ) {}

  create(createShopDto: CreateShopDto): Promise<Shop> {
    const newShop = this.shopsRepository.create(createShopDto);
    return this.shopsRepository.save(newShop);
  }

  findAll(): Promise<Shop[]> {
    return this.shopsRepository.find();
  }

  async update(id: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.shopsRepository.preload({
        id: id,
        ...updateShopDto,
    });
    if (!shop) {
        throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    return this.shopsRepository.save(shop);
  }

  async remove(id: string): Promise<void> {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['employees', 'inventory'],
    });
    
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    if (shop.employees.length > 0) {
      throw new BadRequestException('Cannot delete a shop with employees assigned. Please reassign them first.');
    }
    if (shop.inventory.some(inv => inv.quantity > 0)) {
        throw new BadRequestException('Cannot delete a shop with active stock. Please transfer or clear inventory first.');
    }

    await this.shopsRepository.remove(shop);
  }
}