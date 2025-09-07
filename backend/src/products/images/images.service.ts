/* eslint-disable prettier/prettier */
// src/products/images/images.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './product-image.entity';

// Define our own file type interface
interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
  ) {}

  async create(productId: string, file: UploadedFile): Promise<ProductImage> {
    const newImage = this.imageRepository.create({
      productId,
      data: Buffer.from(file.buffer),
      mimetype: file.mimetype,
    });
    return this.imageRepository.save(newImage);
  }

  async findOne(id: string): Promise<ProductImage> {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found.`);
    }
    return image;
  }
  
  async remove(id: string): Promise<void> {
      const result = await this.imageRepository.delete(id);
      if (result.affected === 0) {
          throw new NotFoundException(`Image with ID ${id} not found.`);
      }
  }
}