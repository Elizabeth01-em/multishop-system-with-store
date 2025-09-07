/* eslint-disable prettier/prettier */
// src/orders/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Shop } from '../shops/shop.entity'; // <-- Import Shop entity

// This enum is likely already here, but make sure it is
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // ... (customerName, email, etc. are here)
  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  shippingAddress: string;

  @Column('decimal')
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;
  
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];


  @ManyToOne(() => Shop, (shop) => shop.orders)
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ nullable: true }) // Nullable for now, but will be set on order creation
  shopId: string;

  // Add userId property to fix the error
  @Column({ nullable: true })
  userId: string;

  @Column({ unique: true, nullable: true })
  externalId: string; // Used to track with payment provider

  @Column({ nullable: true })
  transactionId: string; // The ID from AzamPay
}