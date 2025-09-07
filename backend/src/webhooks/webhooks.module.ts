/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [WebhooksController],
  providers: [],
  exports: []
})
export class WebhooksModule {}