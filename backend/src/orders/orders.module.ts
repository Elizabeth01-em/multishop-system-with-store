/* eslint-disable prettier/prettier */
// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity'; 
import { Product } from '../products/product.entity';
import { Inventory } from '../inventory/inventory.entity'
import { InventoryModule } from '../inventory/inventory.module'
import { AzampayModule } from '../azampay/azampay.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Product,   
      Inventory,
    ]),
    InventoryModule,
    AzampayModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Export OrdersService so other modules can use it
})
export class OrdersModule {}