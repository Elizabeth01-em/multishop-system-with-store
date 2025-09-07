/* eslint-disable prettier/prettier */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';
import { SalesPeriodDto } from './dto/sales-period.dto'; // <-- Import DTO
import { TopProductsDto } from './dto/top-products.dto';   // <-- Import DTO
import { SalesByPeriodResult, PerformanceByShopResult, TopProductsResult } from './types';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-overview')
  getSalesOverview(
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
  ) {
    return this.reportsService.getSalesOverview(startDate);
  }

  @Get('inventory-overview')
  getInventoryOverview() {
    return this.reportsService.getInventoryOverview();
  }

  /**
   * NEW: Sales trend endpoint.
   * e.g., /reports/sales-by-period?range=90d&period=weekly
   */
  @Get('sales-by-period')
  getSalesByPeriod(@Query() salesPeriodDto: SalesPeriodDto): Promise<SalesByPeriodResult[]> {
    return this.reportsService.getSalesByPeriod(salesPeriodDto);
  }

  /**
   * NEW: Shop performance comparison endpoint.
   */
  @Get('performance-by-shop')
  getPerformanceByShop(): Promise<PerformanceByShopResult[]> {
    return this.reportsService.getPerformanceByShop();
  }

  /**
   * NEW: Company-wide top products endpoint.
   */
  @Get('top-products')
  getTopProducts(@Query() topProductsDto: TopProductsDto): Promise<TopProductsResult[]> {
    return this.reportsService.getTopProducts(
      topProductsDto.startDate,
      topProductsDto.endDate,
    );
  }
}