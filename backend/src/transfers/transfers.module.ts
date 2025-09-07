/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { Inventory } from '../inventory/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockTransfer, Inventory]),
    InventoryModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}