/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post('azampay/callback')
  @HttpCode(200) // AzamPay expects 200 OK response
  async handleAzamPayCallback(@Body() callbackData: any) {
    this.logger.log('Received AzamPay callback', callbackData);
    
    try {
      // Extract the external ID from the callback data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const externalId = callbackData.externalId;
      
      if (!externalId) {
        this.logger.error('Missing externalId in callback data', callbackData);
        return { 
          success: false, 
          message: 'Missing externalId',
          timestamp: new Date().toISOString()
        };
      }
      
      // Extract additional data from the callback
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const transactionId = callbackData.transactionId;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const status = callbackData.status;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const message = callbackData.message;
      
      this.logger.log(`Processing callback for externalId: ${externalId}, status: ${status}, transactionId: ${transactionId}`);
      
      // Confirm the payment and update order status
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const order = await this.ordersService.confirmOrderPayment(externalId);
      
      if (!order) {
        this.logger.error(`Order with externalId ${externalId} not found or already processed`);
        return { 
          success: false, 
          message: 'Order not found or already processed',
          externalId: externalId,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log the transaction details
      this.logger.log(`Order ${order.id} confirmed with externalId ${externalId}`);
      
      // If we have a transaction ID, save it to the order
      if (transactionId) {
        order.transactionId = transactionId;
        // We would need to inject the orders repository to save this
        // For now, we'll just log it
        this.logger.log(`Transaction ID ${transactionId} associated with order ${order.id}`);
      }
      
      // Route the order for fulfillment
      await this.ordersService.routeOrderForFulfillment(order.id);
      
      this.logger.log(`Successfully processed payment for order ${order.id}`);
      return { 
        success: true, 
        message: 'Payment processed successfully',
        orderId: order.id,
        externalId: externalId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error processing AzamPay callback', error);
      return { 
        success: false, 
        message: 'Error processing payment',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}