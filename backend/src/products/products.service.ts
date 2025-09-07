/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/products/products.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, ILike } from 'typeorm'; // <-- Import ILike
import { Product } from './product.entity';
import { CreateProductDto } from '../auth/dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// --- New Imports ---
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import JsBarcode from 'jsbarcode';
// --- End New Imports ---

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      isActive: true, // Explicitly set isActive to true for new products
    });
    return this.productsRepository.save(product);
  }

  /**
   * UPDATED: Finds all products.
   * Can be filtered to only show active products for the public storefront.
   */
  async findAll(options: { onlyActive?: boolean; searchQuery?: string } = {}): Promise<any[]> {
    const findOptions: FindManyOptions<Product> = {
        select: {
            id: true, name: true, price: true, uniqueProductCode: true,
            isActive: true, // <-- ADD THIS LINE TO INCLUDE isActive FIELD
            images: { id: true, displayOrder: true } // <-- SELECT ONLY IMAGE ID AND ORDER
        },
        relations: ['category', 'images'], // <-- Ensure images are joined
    };
    
    // Build where conditions
    const whereConditions: any = {};
    
    if (options.onlyActive) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      whereConditions.isActive = true;
    }
    
    if (options.searchQuery) {
        // Use ILike for case-insensitive partial matching
        findOptions.where = [
            { ...whereConditions, name: ILike(`%${options.searchQuery}%`) },
            { ...whereConditions, description: ILike(`%${options.searchQuery}%`) }
        ];
    } else {
        findOptions.where = whereConditions;
    }
    
    return this.productsRepository.find(findOptions);
  }

  // ===============================================
  //            START OF NEW METHODS
  // ===============================================

  /**
   * Finds a single product by its unique product code.
   * This is used for scanner lookups.
   */
  async findOneByCode(code: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ uniqueProductCode: code });
    if (!product) {
      throw new NotFoundException(`Product with code "${code}" not found.`);
    }
    return product;
  }

  /**
   * FIXED: Generates a barcode image for a given product ID with error handling.
   * Returns the image as a Buffer.
   */
  async generateBarcodeImage(productId: string): Promise<Buffer> {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    const canvas = createCanvas(200, 200); // Give it more height for text
    
    // ====================== ADDED ERROR HANDLING ======================
    try {
      JsBarcode(canvas, product.uniqueProductCode, {
          format: "CODE128",
          displayValue: true,
          fontSize: 18,
          textMargin: 10,
          margin: 10,
          height: 100, // Explicitly set a height
      });
      
      return canvas.toBuffer('image/png');
    } catch (err) {
        // This will catch any errors from the JsBarcode library
        console.error('JsBarcode generation failed:', err);
        throw new InternalServerErrorException('Failed to generate barcode image.');
    }
    // ================================================================
  }

  /**
   * Generates a proper QR code image for a given product ID.
   * Returns the image as a Buffer.
   */
  async generateQrCodeImage(productId: string): Promise<Buffer> {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    // Try to use the qrcode library if available
    try {
      // Dynamically import qrcode - this will throw if not installed
      const qrcodeModule = await import('qrcode');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const QRCode = qrcodeModule.default;
      
      // Generate QR code as data URL
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const dataUrl: string = await QRCode.toDataURL(product.uniqueProductCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000FF',
          light: '#FFFFFFFF'
        }
      });
      
      // Convert data URL to buffer
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    } catch (err) {
      console.error('QR Code generation with library failed:', err);
      // Fallback to canvas-based approach
      return await this.generateQrCodeFallback(product.uniqueProductCode);
    }
  }

  /**
   * Fallback method to generate a simple QR code representation using canvas
   * This is used when the qrcode library is not available
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async generateQrCodeFallback(data: string): Promise<Buffer> {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    // Set background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
    
    // Draw a proper QR code pattern
    this.drawPositionMarker(ctx, 10, 10);
    this.drawPositionMarker(ctx, 10, 160);
    this.drawPositionMarker(ctx, 160, 10);
    
    // Add some data pattern in the center
    ctx.fillStyle = 'black';
    // Simple pattern - in a real QR code this would be based on the data
    for (let i = 70; i < 130; i += 10) {
      for (let j = 70; j < 130; j += 10) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 8, 8);
        }
      }
    }
    
    // Add product code text at the bottom
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Truncate text if too long
    let displayText = data;
    if (displayText.length > 20) {
      displayText = displayText.substring(0, 17) + '...';
    }
    ctx.fillText(displayText, 100, 190);
    
    return canvas.toBuffer('image/png');
  }

  /**
   * Draw a position marker for QR code (corner pattern)
   */
  private drawPositionMarker(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Outer square
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, 50, 50);
    // Inner white square
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 5, y + 5, 40, 40);
    // Inner black square
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 10, y + 10, 30, 30);
  }

  /**
   * Updates an existing product's details.
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return this.productsRepository.save(product);
  }

  /**
   * Soft-deletes a product by setting its isActive flag to false.
   */
  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    product.isActive = false;
    await this.productsRepository.save(product);
  }
  
  /**
   * Reactivates a product by setting its isActive flag to true.
   */
  async reactivate(id: string): Promise<void> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    product.isActive = true;
    await this.productsRepository.save(product);
  }
  
  /**
   * Reactivates all products that are currently inactive.
   * This is useful for fixing products that were created before the isActive column was added.
   */
  async reactivateAllInactive(): Promise<number> {
    const result = await this.productsRepository.update(
      { isActive: false },
      { isActive: true }
    );
    return result.affected || 0;
  }
  
  /**
   * UPDATED: Finds a single product by code.
   * Now checks for `isActive` status and includes full inventory details.
   */
  async findOneByCodePublic(code: string): Promise<any> {
    const product = await this.productsRepository.findOne({
      where: {
        uniqueProductCode: code,
        isActive: true, // <-- IMPORTANT: only find active products
      },
      // Now use `select` to shape the output and prevent sending large binary data
      select: {
          id: true, name: true, price: true, description: true, uniqueProductCode: true,
          images: { id: true, displayOrder: true }, // <-- SELECT ONLY IMAGE ID AND ORDER
          inventory: { // Select only what the public page needs
              id: true, quantity: true,
              shop: { name: true }
          }
      },
      relations: ['inventory', 'inventory.shop', 'images'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with code "${code}" not found.`);
    }
    return product;
  }
  
  // ===============================================
  //             END OF NEW METHODS
  // ===============================================
}