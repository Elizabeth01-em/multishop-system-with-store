/* eslint-disable prettier/prettier */
// src/orders/dto/checkout.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CartItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsNotEmpty() quantity: number;
}

export class CheckoutDto {
  @IsString() @IsNotEmpty() customerName: string;
  @IsEmail() customerEmail: string;
  @IsString() @IsNotEmpty() shippingAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString() @IsNotEmpty() provider: string;
  @IsString() @IsNotEmpty() accountNumber: string;
}