/* eslint-disable prettier/prettier */
// src/products/images/product-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' }) // Binary data for the image
  data: Buffer;

  @Column() // e.g., 'image/png', 'image/jpeg'
  mimetype: string;
  
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'productId' })
  product: Product;
  
  @Column()
  productId: string;
}