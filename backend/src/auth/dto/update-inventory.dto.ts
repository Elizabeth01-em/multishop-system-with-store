/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/inventory/dto/update-inventory.dto.ts
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;
  
  @IsNumber()
  @Min(0)
  quantity: number;
}