// src/inventory/dto/update-threshold.dto.ts
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class UpdateThresholdDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  lowStockThreshold: number;
}
