/* eslint-disable prettier/prettier */
// src/stock-logs/stock-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Shop } from '../shops/shop.entity';
import { User } from '../users/user.entity';
import { StockLogReason } from '../common/enums/stock-log-reason.enum';

@Entity({ name: 'stock_logs' })
export class StockLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantityChange: number; // e.g., +50 or -3

  @Column({ type: 'enum', enum: StockLogReason })
  reason: StockLogReason;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Product, { eager: true }) // eager loads product for convenience
  @JoinColumn({ name: 'productId' })
  product: Product;
  @Column()
  productId: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shopId' })
  shop: Shop;
  @Column()
  shopId: string;
  
  @ManyToOne(() => User, { eager: true }) // eager loads user for convenience
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: string;
}