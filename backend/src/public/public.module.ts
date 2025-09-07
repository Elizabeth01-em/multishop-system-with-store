/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProductsModule } from '../products/products.module';
import { ImagesService } from '../products/images/images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from '../products/images/product-image.entity';
import { CategoriesModule } from '../categories/categories.module'; // <-- Import

@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forFeature([ProductImage]),
    CategoriesModule, // <-- Add it here
  ],
  controllers: [PublicController],
  providers: [ImagesService],
})
export class PublicModule {}