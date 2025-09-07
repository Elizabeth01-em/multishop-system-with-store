/* eslint-disable prettier/prettier */
// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';
import { InventoryController } from './inventory.controller';
import { StockLog } from '../stock-logs/stock-log.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, StockLog])], 
  providers: [InventoryService],
  exports: [InventoryService, TypeOrmModule],
  controllers: [InventoryController],
})
export class InventoryModule {}