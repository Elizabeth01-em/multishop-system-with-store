/* eslint-disable prettier/prettier */
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductImage } from './images/product-image.entity'; // <-- Import
import { InventoryModule } from '../inventory/inventory.module';
import { ImagesService } from './images/images.service'; // <-- Import

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), // <-- Add entity
    InventoryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ImagesService], // <-- Add service
  exports: [ProductsService],
})
export class ProductsModule {}