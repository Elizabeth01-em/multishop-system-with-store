// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Inventory } from '../inventory/inventory.entity';
import { SalesPeriodDto } from './dto/sales-period.dto';
import { Shop } from '../shops/shop.entity';
import { OrderItem } from '../orders/order-item.entity';

// Define interfaces for raw query results
interface RawSalesOverview {
  totalRevenue: string;
  totalSalesCount: string;
}

interface RawSalesByPeriod {
  period: Date;
  totalRevenue: string;
}

interface RawPerformanceByShop {
  shopName: string;
  totalRevenue: string;
  totalSalesCount: string;
  averageOrderValue: string;
}

interface RawTopProducts {
  productName: string;
  uniqueProductCode: string;
  totalQuantitySold: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getSalesOverview(startDate?: Date) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (startDate) {
      queryBuilder.where('order.createdAt >= :startDate', { startDate });
    }

    const result: RawSalesOverview | undefined = await queryBuilder
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(order.id)', 'totalSalesCount')
      .getRawOne();

    return {
      totalRevenue: result?.totalRevenue ? parseFloat(result.totalRevenue) : 0,
      totalSalesCount: result?.totalSalesCount
        ? parseInt(result.totalSalesCount, 10)
        : 0,
    };
  }

  async getInventoryOverview() {
    // Fetch all products with all their inventory and shop relations
    const products = await this.productRepository.find({
      relations: ['inventory', 'inventory.shop'],
    });

    // Process the data in TypeScript
    const inventoryOverview = products.map((product) => {
      const totalStock = product.inventory.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );

      const stockByShop = product.inventory.map((inv) => ({
        inventoryId: inv.id, // <-- ADD THIS LINE
        shopId: inv.shopId,
        shopName: inv.shop.name,
        quantity: inv.quantity,
        lowStockThreshold: inv.lowStockThreshold, // <-- ADD THIS LINE
      }));

      return {
        productId: product.id,
        productName: product.name,
        uniqueProductCode: product.uniqueProductCode,
        totalStock,
        stockByShop,
      };
    });

    return inventoryOverview;
  }

  async getSalesByPeriod(salesPeriodDto: SalesPeriodDto) {
    const { range, period } = salesPeriodDto;
    const startDate = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate.setDate(startDate.getDate() - 30);

    const dateTruncUnit = period || 'day';

    const results: RawSalesByPeriod[] = await this.orderRepository
      .createQueryBuilder('order')
      .select(`DATE_TRUNC('${dateTruncUnit}', order.createdAt)`, 'period')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .where('order.createdAt >= :startDate', { startDate })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      date: r.period.toISOString().split('T')[0],
      totalRevenue: parseFloat(r.totalRevenue) || 0,
    }));
  }

  /**
   * FIXED: Aggregates KPIs for each shop.
   */
  async getPerformanceByShop() {
    const results: RawPerformanceByShop[] = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin(Shop, 'shop', 'shop.id = order.shopId')
      .select('shop.name', 'shopName')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(order.id)', 'totalSalesCount')
      .addSelect('AVG(order.totalAmount)', 'averageOrderValue')
      .groupBy('shop.id, shop.name')
      // ========== THE FIX IS HERE: Add quotes around the alias ==========
      .orderBy('"totalRevenue"', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      shopName: r.shopName,
      totalRevenue: parseFloat(r.totalRevenue) || 0,
      totalSalesCount: parseInt(r.totalSalesCount, 10) || 0,
      averageOrderValue: parseFloat(r.averageOrderValue) || 0,
    }));
  }

  async getTopProducts(startDate?: string, endDate?: string) {
    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product')
      .select('product.name', 'productName')
      .addSelect('product.uniqueProductCode', 'uniqueProductCode')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantitySold')
      .groupBy('product.id, product.name, product.uniqueProductCode')
      .orderBy('"totalQuantitySold"', 'DESC')
      .limit(20);

    if (startDate && endDate) {
      queryBuilder.leftJoin('orderItem.order', 'order').where({
        order: { createdAt: Between(new Date(startDate), new Date(endDate)) },
      });
    }

    const results: RawTopProducts[] = await queryBuilder.getRawMany();

    return results.map((r) => ({
      productName: r.productName,
      uniqueProductCode: r.uniqueProductCode,
      totalQuantitySold: parseInt(r.totalQuantitySold, 10) || 0,
    }));
  }
}
