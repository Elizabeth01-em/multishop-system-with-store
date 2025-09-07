/* eslint-disable prettier/prettier */
// src/inventory/inventory.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Inventory } from './inventory.entity';
import { UpdateInventoryDto } from '../auth/dto/update-inventory.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { StockLog } from '../stock-logs/stock-log.entity';
import { StockLogReason } from '../common/enums/stock-log-reason.enum';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockLog)
    private stockLogRepository: Repository<StockLog>,
  ) {}

  /**
   * NEW: Finds all inventory items for a specific shop, including product details.
   */
  findAllByShopId(shopId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { shopId },
      relations: ['product'], // This tells TypeORM to join and load the related product
    });
  }

  /**
   * Adjusts stock for a product in a specific shop and creates a stock log entry.
   * This method can work with a transaction manager if provided.
   */
  async adjustStock(
    stockAdjustment: {
      productId: string;
      shopId: string;
      quantityChange: number;
      reason: StockLogReason;
      userId: string;
      note?: string;
    },
    manager?: EntityManager,
  ): Promise<Inventory> {
    const { productId, shopId, quantityChange, reason, userId, note } = stockAdjustment;

    // Use the provided manager (for transactions) or the default repository
    const inventoryRepo = manager ? manager.getRepository(Inventory) : this.inventoryRepository;
    const stockLogRepo = manager ? manager.getRepository(StockLog) : this.stockLogRepository;

    // Find or create inventory item
    let inventory = await inventoryRepo.findOne({
      where: { productId, shopId },
    });

    if (!inventory) {
      inventory = inventoryRepo.create({
        productId,
        shopId,
        quantity: 0,
      });
    }

    // Check if we have enough stock for negative adjustments (sales, returns, etc.)
    if (quantityChange < 0 && inventory.quantity + quantityChange < 0) {
      throw new NotFoundException(
        `Not enough stock for product ID ${productId}. Current stock: ${inventory.quantity}, requested: ${Math.abs(quantityChange)}`,
      );
    }

    // Update quantity
    inventory.quantity += quantityChange;

    // Save inventory
    await inventoryRepo.save(inventory);

    // Create stock log entry
    const stockLog = stockLogRepo.create({
      productId,
      shopId,
      userId,
      quantityChange,
      reason,
      note,
    });

    await stockLogRepo.save(stockLog);

    return inventory;
  }

  /**
   * (Previously in Products logic) Updates the inventory for a product in a specific shop.
   * The shopId is determined from the logged-in user's token.
   */
  async update(
    updateInventoryDto: UpdateInventoryDto,
    requestingUser: any,
  ): Promise<Inventory> {
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requestingUser.role === UserRole.EMPLOYEE &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !requestingUser.shopId
    ) {
      throw new UnauthorizedException('Employee is not assigned to a shop.');
    }

    const { productId, quantity } = updateInventoryDto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const shopId = requestingUser.shopId;

    let inventory = await this.inventoryRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { productId, shopId },
    });

    if (inventory) {
      inventory.quantity = quantity;
    } else {
      inventory = this.inventoryRepository.create({
        productId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        shopId,
        quantity,
      });
    }

    return this.inventoryRepository.save(inventory);
  }

  /**
   * Gets the stock history for a product in a specific shop.
   */
  async getHistoryForProduct(
    productId: string,
    shopId: string,
  ): Promise<StockLog[]> {
    return this.stockLogRepository.find({
      where: { productId, shopId },
      order: { timestamp: 'DESC' },
      relations: ['product', 'user'],
    });
  }

  /**
   * NEW: Finds all inventory records for a single product across all shops.
   */
  async findAllStockForProduct(productId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { productId },
      relations: ['shop'], // Important: join the shop details
    });
  }

  /**
   * NEW: Updates the low stock threshold for a single inventory item.
   * Owner-only action.
   */
  async updateThreshold(inventoryId: string, newThreshold: number): Promise<Inventory> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    
    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item with ID "${inventoryId}" not found.`);
    }

    inventoryItem.lowStockThreshold = newThreshold;
    return this.inventoryRepository.save(inventoryItem);
  }
}