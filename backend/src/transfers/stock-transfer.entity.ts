/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransferStatus } from '../common/enums/transfer-status.enum';
import { Product } from '../products/product.entity';
import { Shop } from '../shops/shop.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'stock_transfers' })
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.REQUESTED,
  })
  status: TransferStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Timestamps for lifecycle events
  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  // Foreign Keys
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
  @Column()
  productId: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'fromShopId' })
  fromShop: Shop; // Shop REQUESTING the stock
  @Column()
  fromShopId: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'toShopId' })
  toShop: Shop; // Shop SENDING the stock
  @Column()
  toShopId: string;

  // User Audit Trail
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestingUserId' })
  requestingUser: User;
  @Column()
  requestingUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvingUserId' })
  approvingUser: User;
  @Column({ nullable: true })
  approvingUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shippingUserId' })
  shippingUser: User;
  @Column({ nullable: true })
  shippingUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receivingUserId' })
  receivingUser: User;
  @Column({ nullable: true })
  receivingUserId: string;
}