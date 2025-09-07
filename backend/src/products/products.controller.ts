/* eslint-disable prettier/prettier */ 
import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete, Res, UploadedFiles, UseInterceptors } from '@nestjs/common'; // <-- Add Res
import type { Response } from 'express'; // <-- Import Response from express
import { ProductsService } from './products.service';
import { CreateProductDto } from '../auth/dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProductDto } from './dto/update-product.dto'; // <-- Import
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images/images.service'; // <-- Import
import { Multer } from 'multer'; // <-- Import Multer type

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ImagesService, // <-- Inject image service
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // --- NEW PUBLIC LOOKUP ENDPOINT ---
  /**
   * Public endpoint to look up a product by its code.
   * Used by scanner interfaces. No auth required for a simple lookup.
   */
  @Get('lookup/:code')
  @UseGuards() // This overrides the controller-level guard, making it public
  findOneByCode(@Param('code') code: string) {
      return this.productsService.findOneByCode(code);
  }
  // --- END NEW PUBLIC LOOKUP ENDPOINT ---
  
  // ===============================================
  //            START OF NEW ENDPOINTS
  // ===============================================

  /**
   * Endpoint to generate and return a barcode image for a product.
   * Returns a PNG image, not JSON.
   */
  @Get(':id/barcode')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE) // Any logged-in user can generate a barcode
  async getBarcode(
    @Param('id') id: string,
    @Res() res: Response // Inject the Express response object
  ) {
    try {
      const imageBuffer = await this.productsService.generateBarcodeImage(id);
      
      // Set the content type header to tell the browser this is an image
      res.setHeader('Content-Type', 'image/png');
      
      // Send the buffer as the response
      return res.send(imageBuffer);
    } catch (error) {
      console.error('Error generating barcode:', error);
      return res.status(500).send('Error generating barcode');
    }
  }

  /**
   * Endpoint to generate and return a QR code image for a product.
   * Returns a PNG image, not JSON.
   */
  @Get(':id/qrcode')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE) // Any logged-in user can generate a QR code
  async getQrCode(
    @Param('id') id: string,
    @Res() res: Response // Inject the Express response object
  ) {
    try {
      const imageBuffer = await this.productsService.generateQrCodeImage(id);
      
      // Set the content type header to tell the browser this is an image
      res.setHeader('Content-Type', 'image/png');
      
      // Send the buffer as the response
      return res.send(imageBuffer);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res.status(500).send('Error generating QR code');
    }
  }

  /**
   * Endpoint for reactivating all inactive products. OWNER-only.
   */
  @Patch('reactivate-all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  async reactivateAll() {
    const count = await this.productsService.reactivateAllInactive();
    return { message: `Reactivated ${count} products` };
  }
  
  /**
   * Endpoint for reactivating a product. OWNER-only.
   */
  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  reactivate(@Param('id') id: string) {
    return this.productsService.reactivate(id);
  }

  /**
   * Endpoint for updating a product. OWNER-only.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Endpoint for soft-deleting (discontinuing) a product. OWNER-only.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete('images/:imageId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  deleteImage(@Param('imageId') imageId: string) {
      return this.imagesService.remove(imageId);
  }

  @Post(':id/images')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  @UseInterceptors(FilesInterceptor('files', 10)) // Accept up to 10 files with field name 'files'
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Multer.File>,
  ) {
    // Sequentially process files to maintain order somewhat predictably
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return Promise.all(files.map(file => this.imagesService.create(id, file)));
  }
  
  // ===============================================
  //             END OF NEW ENDPOINTS
  // ===============================================
}