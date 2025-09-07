/* eslint-disable prettier/prettier */
// src/orders/dto/update-order-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}