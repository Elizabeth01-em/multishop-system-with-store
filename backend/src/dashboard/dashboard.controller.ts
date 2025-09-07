/* eslint-disable prettier/prettier */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ShopGuard } from '../auth/guards/shop.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats/:shopId')
  @UseGuards(ShopGuard)
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  getDashboardStats(@Param('shopId') shopId: string) {
    return this.dashboardService.getDashboardStats(shopId);
  }
}