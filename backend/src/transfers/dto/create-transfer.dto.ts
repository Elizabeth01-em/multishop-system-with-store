/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  toShopId: string; // The ID of the shop to request from

  @IsNumber()
  @IsPositive()
  quantity: number;
}