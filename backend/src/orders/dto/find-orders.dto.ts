/* eslint-disable prettier/prettier */
// src/orders/dto/find-orders.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class FindOrdersDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}