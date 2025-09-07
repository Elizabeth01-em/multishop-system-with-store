/* eslint-disable prettier/prettier */
// src/inventory/inventory.entity.ts
import { Product } from '../products/product.entity';
import { Shop } from '../shops/shop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'inventory' })
@Unique(['product', 'shop']) // Enforces that a product can only exist once per shop
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  // ===================================
  // ADD THIS COLUMN
  // ===================================
  @Column({ type: 'int', default: 10 })
  lowStockThreshold: number;
  // ===================================

  @ManyToOne(() => Product, (product) => product.inventory, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Shop, (shop) => shop.inventory, { eager: true })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column()
  shopId: string;
}