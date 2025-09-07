/* eslint-disable prettier/prettier */
// src/shops/shops.controller.ts
import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from '../auth/dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER) // Protect entire controller
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @Roles(UserRole.OWNER)
  findAll() {
    return this.shopsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopsService.remove(id);
  }
}