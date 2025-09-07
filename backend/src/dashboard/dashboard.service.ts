/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from '../inventory/inventory.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Inventory) private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  async getDashboardStats(shopId: string) {
    const [pendingOrders, lowStockItems, topSellerIds] = await Promise.all([
      this.getPendingOrdersCount(shopId),
      this.getLowStockItems(shopId),
      this.getTopSellerIds(shopId),
    ]);

    const topSellers = await this.resolveTopSellerProducts(topSellerIds);

    return {
      pendingOrders,
      lowStockItems,
      topSellers,
    };
  }

  private getPendingOrdersCount(shopId: string): Promise<number> {
    return this.orderRepository.count({
      where: {
        shopId,
        status: In([OrderStatus.PENDING, OrderStatus.PAID]),
      },
    });
  }

  // =============================== FIX #1 IS HERE ===============================
  private getLowStockItems(shopId: string): Promise<Inventory[]> {
    // Switching to QueryBuilder for a more robust raw SQL condition
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.shopId = :shopId', { shopId })
      .andWhere('inventory.quantity <= inventory.lowStockThreshold') // This is a safe way to compare two columns
      .orderBy('inventory.quantity', 'ASC')
      .take(5)
      .getMany();
  }

  // =============================== FIX #2 IS HERE ===============================
  private async getTopSellerIds(shopId: string): Promise<{ productId: string; totalSold: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('orderItem.productId', 'productId')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .leftJoin('orderItem.order', 'order')
      .where('order.shopId = :shopId', { shopId })
      .andWhere('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('orderItem.productId')
      .orderBy('"totalSold"', 'DESC') // Using quotes around the alias makes it case-sensitive and correct
      .limit(5)
      .getRawMany();

    // Type-safe mapping of results
    return results.map((r: any) => ({ 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      productId: r.productId, 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      totalSold: parseInt(r.totalSold, 10) 
    }));
  }

  private async resolveTopSellerProducts(topSellerIds: { productId: string; totalSold: number }[]) {
    if (topSellerIds.length === 0) {
      return [];
    }
    const productIds = topSellerIds.map((s) => s.productId);
    const products = await this.productRepository.find({ where: { id: In(productIds) } });

    return topSellerIds.map((seller) => {
      const product = products.find((p) => p.id === seller.productId);
      return {
        ...seller,
        name: product?.name || 'Unknown Product',
        uniqueProductCode: product?.uniqueProductCode || 'N/A',
      };
    });
  }
}