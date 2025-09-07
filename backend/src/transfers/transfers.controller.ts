/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { ShopGuard } from '../auth/guards/shop.guard';
import { UpdateTransferStatusDto } from './dto/update-transfer-status.dto';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.EMPLOYEE)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  create(@Body() createTransferDto: CreateTransferDto, @Request() req: any) {
    return this.transfersService.createTransferRequest(
      createTransferDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user,
    );
  }

  @Get('/shop/:shopId')
  @UseGuards(ShopGuard)
  findAllForShop(@Param('shopId') shopId: string) {
    return this.transfersService.getTransfersForShop(shopId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTransferStatusDto: UpdateTransferStatusDto,
    @Request() req: any,
  ) {
    return this.transfersService.updateTransferStatus(
      id,
      updateTransferStatusDto.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user,
    );
  }
}