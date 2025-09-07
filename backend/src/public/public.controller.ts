/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Res, Query } from '@nestjs/common'; // <-- Import Query
import { ProductsService } from '../products/products.service';
import { ImagesService } from '../products/images/images.service';
import { CategoriesService } from '../categories/categories.service'; // <-- Import
import type { Response } from 'express';

@Controller('public')
export class PublicController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ImagesService,
    private readonly categoriesService: CategoriesService, // <-- Inject
  ) {}

  /**
   * Endpoint for the e-commerce store to get a list of all available products.
   * This is a public, unauthenticated endpoint.
   */
  @Get('products')
  findAllPublicProducts(@Query('q') q?: string) {
    // <-- Add the Query param
    return this.productsService.findAll({ onlyActive: true, searchQuery: q });
  }

  /**
   * Endpoint for the e-commerce store to get the details of a single product page.
   * This is a public, unauthenticated endpoint.
   */
  @Get('products/:code')
  findOnePublicProduct(@Param('code') code: string) {
    return this.productsService.findOneByCodePublic(code);
  }

  // ===== NEW ENDPOINT =====
  @Get('images/:id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const image = await this.imagesService.findOne(id);
    res.setHeader('Content-Type', image.mimetype);
    res.send(image.data);
  }

  @Get('categories')
  findAllPublicCategories() {
    return this.categoriesService.findAllPublic();
  }
}