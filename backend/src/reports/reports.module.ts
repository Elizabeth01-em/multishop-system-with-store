/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Inventory } from '../inventory/inventory.entity';
import { Shop } from '../shops/shop.entity';
import { OrderItem } from '../orders/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Order,
    Product,
    Inventory,
    Shop,
    OrderItem,
  ])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}