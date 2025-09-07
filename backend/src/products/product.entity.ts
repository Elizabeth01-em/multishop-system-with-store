/* eslint-disable prettier/prettier */
// src/products/product.entity.ts
import { Category } from '../categories/category.entity';
import { Inventory } from '../inventory/inventory.entity';
import { OrderItem } from '../orders/order-item.entity';
import { ProductImage } from './images/product-image.entity'; // <-- Import
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal')
  price: number;

  @Column({ unique: true })
  uniqueProductCode: string;

  // ===================================
  //           ADD THIS COLUMN
  // ===================================
  @Column({ default: true })
  isActive: boolean;
  // ===================================

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory[];
  
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
  
  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true }) // <-- Add this relationship
  images: ProductImage[];
}