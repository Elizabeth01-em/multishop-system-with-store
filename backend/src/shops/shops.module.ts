// src/shops/shops.module.ts
import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])], // <-- Add this line
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
