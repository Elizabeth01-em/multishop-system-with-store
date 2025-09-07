/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ShopGuard } from '../auth/guards/shop.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
// No global guard on the controller, individual methods will be protected
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint for customers to fetch their own orders.
   */
  @Get('my-orders')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE, UserRole.CUSTOMER)
  getMyOrders(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.ordersService.getOrdersForUser(req.user.id);
  }

  /**
   * Endpoint for customers to fetch a specific order by ID.
   */
  @Get('my-orders/:orderId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE, UserRole.CUSTOMER)
  getMyOrderById(
    @Param('orderId') orderId: string,
    @Request() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.ordersService.getOrderByIdForUser(orderId, req.user.id);
  }

  /**
   * Endpoint for creating a manual order.
   * Accessible by Owners and Employees.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  createOrder(
    @Body() createOrderDto: CreateOrderDto, 
    @Request() req: any
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.ordersService.createOrder(createOrderDto, req.user);
  }

  @Post('checkout/initiate') // This is a public endpoint
  initiateCheckout(@Body() checkoutDto: CheckoutDto) {
    return this.ordersService.initiateCheckout(checkoutDto);
  }

  /**
   * Endpoint for fetching orders for a given shop, with optional status filter.
   * e.g., /orders/shop/some-id?status=SHIPPED
   */
  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard, ShopGuard) // Add JwtAuthGuard and RolesGuard
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  getOrdersForShop(
    @Param('shopId') shopId: string,
    @Query() findOrdersDto: FindOrdersDto,
  ) {
    return this.ordersService.getOrdersForShop(shopId, findOrdersDto.status);
  }

  /**
   * Endpoint for updating the status of a specific order.
   */
  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    // The req.user object is passed to the service for the security check
    return this.ordersService.updateStatus(
      orderId,
      updateOrderStatusDto.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user,
    );
  }
}