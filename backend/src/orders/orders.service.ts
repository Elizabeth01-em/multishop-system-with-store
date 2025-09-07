/* eslint-disable prettier/prettier */
// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository, DataSource, FindManyOptions } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/product.entity';
import { Inventory } from '../inventory/inventory.entity';
import { OrderItem } from './order-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { StockLogReason } from '../common/enums/stock-log-reason.enum';
import { v4 as uuidv4 } from 'uuid';
import { AzamPayService } from 'src/azampay/azampay.service';
import { CheckoutDto, CartItemDto } from './dto/checkout.dto';

// Define interface for requesting user
interface RequestingUser {
  id: string;
  shopId: string;
  role: UserRole;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly azamPayService: AzamPayService, // <-- Inject
  ) {}

  async getOrdersForShop(
    shopId: string,
    status?: OrderStatus,
  ): Promise<Order[]> {
    const options: FindManyOptions<Order> = {
      where: { shopId },
      relations: {
        items: {
          product: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    };

    if (status) {
      options.where = { ...options.where, status } as FindManyOptions<Order>['where'];
    } else {
      options.where = { ...options.where, status: In([OrderStatus.PAID, OrderStatus.PENDING]) } as FindManyOptions<Order>['where'];
    }

    return this.ordersRepository.find(options);
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    const options: FindManyOptions<Order> = {
      where: { userId },
      relations: {
        items: {
          product: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    };

    return this.ordersRepository.find(options);
  }

  async getOrderByIdForUser(orderId: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    requestingUser: RequestingUser,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }

    if (
      requestingUser.role === UserRole.EMPLOYEE &&
      order.shopId !== requestingUser.shopId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this order.',
      );
    }

    order.status = newStatus;
    return this.ordersRepository.save(order);
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    requestingUser: RequestingUser,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { items, ...orderDetails } = createOrderDto;
      const productIds = items.map((item) => item.productId);

      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productIds) },
      });
      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found.');
      }

      const inventoryItems = await queryRunner.manager.find(Inventory, {
        where: {
          productId: In(productIds),
          shopId: requestingUser.shopId,
        },
      });

      let totalAmount = 0;
      const orderItemsToCreate: OrderItem[] = [];

      for (const itemDto of items) {
        const product = products.find((p) => p.id === itemDto.productId);
        const inventoryItem = inventoryItems.find(
          (inv) => inv.productId === itemDto.productId,
        );

        if (!product) {
          throw new BadRequestException(
            `Details for product ID ${itemDto.productId} could not be resolved.`,
          );
        }

        if (!inventoryItem || inventoryItem.quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Not enough stock for product: ${product.name}`,
          );
        }

        // OLD LOGIC (to be removed)
        // inventoryItem.quantity -= itemDto.quantity;

        // NEW LOGIC (replaces old logic)
        await this.inventoryService.adjustStock(
          {
            productId: itemDto.productId,
            shopId: requestingUser.shopId,
            quantityChange: -itemDto.quantity, // Negative for a sale
            reason: StockLogReason.SALE,
            userId: requestingUser.id,
          },
          queryRunner.manager, // <-- Pass the transaction manager!
        );

        totalAmount += Number(product.price) * itemDto.quantity;

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = product.price;
        orderItemsToCreate.push(orderItem);
      }

      const newOrder = queryRunner.manager.create(Order, {
        ...orderDetails,
        totalAmount,
        status: OrderStatus.PAID,
        shopId: requestingUser.shopId,
        userId: requestingUser.id,
        items: orderItemsToCreate,
      });

      await queryRunner.manager.save(newOrder);

      // OLD LOGIC (to be removed)
      // await queryRunner.manager.save(inventoryItems);

      await queryRunner.commitTransaction();
      // Important: must return the version from the transaction to get all relations
      const savedOrder = await queryRunner.manager.findOne(Order, {
        where: { id: newOrder.id },
        relations: ['items', 'items.product'],
      });
      if (!savedOrder) {
        throw new NotFoundException(
          `Order with ID "${newOrder.id}" not found after creation`,
        );
      }
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async initiateCheckout(checkoutDto: CheckoutDto) {
    this.logger.log('Initiating checkout', checkoutDto);
    
    // Note: The transaction logic for stock check is simplified here. 
    // The real stock reduction happens after payment confirmation.
    const { items, provider, accountNumber, ...customerDetails } = checkoutDto;
    
    this.logger.log(`Creating pending order for ${items.length} items`);
    
    // Step 1: Calculate total and create PENDING order
    // This logic should be similar to createOrder but sets status to PENDING
    const order = await this.createPendingOrder(customerDetails, items);

    this.logger.log(`Order ${order.id} created with externalId ${order.externalId}`);

    // Step 2: Initiate payment with AzamPay
    this.logger.log(`Initiating payment with AzamPay for order ${order.id}`);
    const paymentResponse = await this.azamPayService.initiateMnoCheckout(order, accountNumber, provider);
    
    this.logger.log(`Payment initiated successfully for order ${order.id}, transactionId: ${paymentResponse.transactionId}`);
    
    // Step 3: Save transaction ID and return
    order.transactionId = paymentResponse.transactionId;
    await this.dataSource.manager.save(order);
    
    this.logger.log(`Order ${order.id} updated with transactionId ${order.transactionId}`);
    
    return { message: "Checkout initiated. Please confirm on your mobile.", orderId: order.id };
  }

  async createPendingOrder(customerDetails: Partial<Order>, items: CartItemDto[]): Promise<Order> {
    this.logger.log(`Creating pending order with ${items.length} items`);
    
    // Create a pending order with a unique external ID
    const externalId = uuidv4();
    
    this.logger.log(`Generated externalId: ${externalId}`);
    
    // Calculate total amount
    const productIds = items.map((item) => item.productId);
    const products = await this.productsRepository.find({
      where: { id: In(productIds) }
    });
    
    this.logger.log(`Found ${products.length} products for order`);

    let totalAmount = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalAmount += Number(product.price) * item.quantity;
        this.logger.log(`Added product ${product.id} price ${product.price} x quantity ${item.quantity}`);
      }
    }
    
    this.logger.log(`Calculated total amount: ${totalAmount}`);

    // Create the order with PENDING status
    const order = this.ordersRepository.create({
      ...customerDetails,
      totalAmount,
      status: OrderStatus.PENDING,
      externalId,
      items: items.map(item => {
        const product = products.find(p => p.id === item.productId);
        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.quantity = item.quantity;
        orderItem.price = product ? product.price : 0;
        return orderItem;
      })
    });
    
    this.logger.log(`Order object created, saving to database`);

    const savedOrder = await this.ordersRepository.save(order);
    
    this.logger.log(`Order saved successfully with ID: ${savedOrder.id}`);
    
    return savedOrder;
  }

  async confirmOrderPayment(externalId: string): Promise<Order | null> {
    this.logger.log(`Confirming payment for order with externalId: ${externalId}`);
    
    // Find the order by external ID
    const order = await this.ordersRepository.findOne({
      where: { externalId }
    });
    
    if (!order) {
      this.logger.warn(`Order with externalId ${externalId} not found`);
      return null;
    }
    
    this.logger.log(`Found order ${order.id} with status ${order.status}`);
    
    // Check if it's still in PENDING status
    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${order.id} is not in PENDING status, current status: ${order.status}`);
      return null;
    }
    
    // Update status to PAID
    order.status = OrderStatus.PAID;
    const updatedOrder = await this.ordersRepository.save(order);
    
    this.logger.log(`Order ${order.id} status updated to PAID`);
    return updatedOrder;
  }

  async routeOrderForFulfillment(orderId: string): Promise<void> {
    this.logger.log(`Routing order ${orderId} for fulfillment`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the order with its items
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items', 'items.product'],
      });

      if (!order) {
        this.logger.warn(`Order with ID "${orderId}" not found`);
        throw new NotFoundException(`Order with ID "${orderId}" not found`);
      }

      this.logger.log(`Found order ${order.id} with ${order.items.length} items`);

      // Get the first item to determine which shop to route to
      if (order.items.length === 0) {
        this.logger.warn(`Order ${order.id} has no items`);
        throw new BadRequestException('Order must have at least one item');
      }

      const firstItem = order.items[0];
      
      this.logger.log(`Routing based on product ${firstItem.productId} with quantity ${firstItem.quantity}`);
      
      // Find a shop with enough stock for the first item
      const inventoryWithStock = await queryRunner.manager.findOne(Inventory, {
        where: {
          productId: firstItem.productId,
          quantity: MoreThanOrEqual(firstItem.quantity),
        },
        order: { quantity: 'DESC' }, // Get the shop with the most stock
      });

      if (!inventoryWithStock) {
        this.logger.warn(`No shop found with sufficient inventory for product ${firstItem.productId}`);
        throw new BadRequestException('No shop found with sufficient inventory for order');
      }

      this.logger.log(`Assigning order to shop ${inventoryWithStock.shopId}`);

      // Update order with shopId and status
      order.shopId = inventoryWithStock.shopId;
      order.status = OrderStatus.PAID;
      await queryRunner.manager.save(order);

      // Adjust stock for all items in the order
      for (const item of order.items) {
        this.logger.log(`Adjusting stock for product ${item.productId}, quantity change: ${-item.quantity}`);
        
        await this.inventoryService.adjustStock(
          {
            productId: item.productId,
            shopId: inventoryWithStock.shopId,
            quantityChange: -item.quantity, // Negative for a sale
            reason: StockLogReason.SALE,
            userId: order.userId, // Use the order's userId
          },
          queryRunner.manager, // Use the transaction manager
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Order ${order.id} successfully routed and fulfilled`);
    } catch (err) {
      this.logger.error(`Error routing order ${orderId} for fulfillment`, err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}