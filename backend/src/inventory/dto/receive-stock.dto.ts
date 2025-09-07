/* eslint-disable prettier/prettier */
// src/inventory/dto/receive-stock.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class ReceiveStockDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}