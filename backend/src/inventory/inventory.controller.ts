/* eslint-disable prettier/prettier */
// src/inventory/inventory.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Request,
  Patch, // <-- Add Patch
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ShopGuard } from '../auth/guards/shop.guard';
import { UpdateInventoryDto } from '../auth/dto/update-inventory.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { StockLogReason } from '../common/enums/stock-log-reason.enum';
import { UpdateThresholdDto } from './dto/update-threshold.dto'; // <-- Import the new DTO

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * NEW: Gets all inventory for a specific shop.
   * Protected to ensure an employee can only get their own shop's data.
   */
  @Get('shop/:shopId')
  @UseGuards(ShopGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  findAllByShop(@Param('shopId') shopId: string) {
    return this.inventoryService.findAllByShopId(shopId);
  }

  /**
   * MOVED: Updates the inventory quantity for a product.
   */
  @Post('update')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  updateInventory(
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Request() req: any,
  ) {
    // req.user is attached by the JwtAuthGuard
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.inventoryService.update(updateInventoryDto, req.user);
  }

  /**
   * NEW: Endpoint for receiving new stock.
   */
  @Post('receive')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  receiveStock(
    @Body() receiveStockDto: ReceiveStockDto,
    @Request() req: any,
  ) {
    return this.inventoryService.adjustStock({
      productId: receiveStockDto.productId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      shopId: req.user.shopId,
      quantityChange: receiveStockDto.quantity,
      reason: StockLogReason.RECEIVING,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userId: req.user.id,
    });
  }

  /**
   * NEW: Endpoint for viewing the audit log for a product in a specific shop.
   */
  @Get('logs/product/:productId/shop/:shopId')
  @UseGuards(ShopGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  getHistory(
    @Param('productId') productId: string,
    @Param('shopId') shopId: string,
  ) {
    return this.inventoryService.getHistoryForProduct(productId, shopId);
  }

  /**
   * NEW: Endpoint for viewing stock levels of a product across all shops.
   */
  @Get('product/:productId/all-shops')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE) // Accessible to all logged-in users
  findAllStockForProduct(@Param('productId') productId: string) {
    return this.inventoryService.findAllStockForProduct(productId);
  }

  /**
   * NEW: Endpoint for updating the low stock threshold of a specific inventory item.
   * This is an OWNER-only action.
   */
  @Patch(':inventoryId/threshold')
  @Roles(UserRole.OWNER)
  updateThreshold(
    @Param('inventoryId') inventoryId: string,
    @Body() updateThresholdDto: UpdateThresholdDto
  ) {
      return this.inventoryService.updateThreshold(
          inventoryId,
          updateThresholdDto.lowStockThreshold
      );
  }
}