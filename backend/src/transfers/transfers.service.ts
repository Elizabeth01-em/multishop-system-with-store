/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Inventory } from '../inventory/inventory.entity';
import { TransferStatus } from '../common/enums/transfer-status.enum';
import { InventoryService } from '../inventory/inventory.service';
import { StockLogReason } from '../common/enums/stock-log-reason.enum';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(StockTransfer)
    private readonly transferRepository: Repository<StockTransfer>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async createTransferRequest(
    dto: CreateTransferDto,
    user: any,
  ): Promise<StockTransfer> {
    const { productId, toShopId, quantity } = dto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const fromShopId = user.shopId;

    if (fromShopId === toShopId) {
      throw new BadRequestException('Cannot transfer stock to the same shop.');
    }

    const targetInventory = await this.inventoryRepository.findOne({
      where: { productId, shopId: toShopId },
    });
    if (!targetInventory || targetInventory.quantity < quantity) {
      throw new BadRequestException(
        'The target shop does not have enough stock to fulfill this request.',
      );
    }

    const newTransfer = this.transferRepository.create({
      productId,
      quantity,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      fromShopId,
      toShopId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestingUserId: user.id,
      status: TransferStatus.REQUESTED,
    });

    return this.transferRepository.save(newTransfer);
  }

  async getTransfersForShop(
    shopId: string,
  ): Promise<{ incoming: StockTransfer[]; outgoing: StockTransfer[] }> {
    const allTransfers = await this.transferRepository.find({
      where: [{ fromShopId: shopId }, { toShopId: shopId }],
      relations: ['product', 'fromShop', 'toShop', 'requestingUser'],
      order: { createdAt: 'DESC' },
    });

    const incoming = allTransfers.filter((t) => t.toShopId === shopId);
    const outgoing = allTransfers.filter((t) => t.fromShopId === shopId);

    return { incoming, outgoing };
  }

  async updateTransferStatus(
    transferId: string,
    newStatus: TransferStatus,
    user: any,
  ): Promise<StockTransfer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transfer = await queryRunner.manager.findOne(StockTransfer, {
        where: { id: transferId },
      });
      if (!transfer) {
        throw new NotFoundException('Transfer request not found.');
      }

      const isFromShop = transfer.fromShopId === user.shopId;
      const isToShop = transfer.toShopId === user.shopId;

      let canUpdate = false;

      // State Machine Logic
      switch (newStatus) {
        case TransferStatus.APPROVED:
        case TransferStatus.REJECTED:
        case TransferStatus.SHIPPED:
          if (isToShop && transfer.status === TransferStatus.REQUESTED) {
            canUpdate = true;
            if (newStatus === TransferStatus.APPROVED)
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              transfer.approvingUserId = user.id;
          }
          if (
            isToShop &&
            transfer.status === TransferStatus.APPROVED &&
            newStatus === TransferStatus.SHIPPED
          ) {
            canUpdate = true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            transfer.shippingUserId = user.id;
            transfer.shippedAt = new Date();
            // Transactional inventory adjustment
            await this.inventoryService.adjustStock(
              {
                productId: transfer.productId,
                shopId: transfer.toShopId,
                quantityChange: -transfer.quantity,
                reason: StockLogReason.TRANSFER,
                note: `Shipped to shop ID ${transfer.fromShopId}`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                userId: user.id,
              },
              queryRunner.manager,
            );
          }
          break;
        case TransferStatus.RECEIVED:
          if (isFromShop && transfer.status === TransferStatus.SHIPPED) {
            canUpdate = true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            transfer.receivingUserId = user.id;
            transfer.receivedAt = new Date();
            await this.inventoryService.adjustStock(
              {
                productId: transfer.productId,
                shopId: transfer.fromShopId,
                quantityChange: transfer.quantity,
                reason: StockLogReason.TRANSFER,
                note: `Received from shop ID ${transfer.toShopId}`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                userId: user.id,
              },
              queryRunner.manager,
            );
          }
          break;
        case TransferStatus.CANCELLED:
          if (isFromShop && transfer.status === TransferStatus.REQUESTED) {
            canUpdate = true;
          }
          break;
      }

      if (!canUpdate) {
        throw new ForbiddenException(
          `Cannot change status from ${transfer.status} to ${newStatus} for this shop.`,
        );
      }

      transfer.status = newStatus;
      await queryRunner.manager.save(transfer);
      await queryRunner.commitTransaction();
      return transfer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}