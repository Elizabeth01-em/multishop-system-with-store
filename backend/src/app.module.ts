/* eslint-disable prettier/prettier */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import all entities
import { User } from './users/user.entity';
import { Shop } from './shops/shop.entity';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { Inventory } from './inventory/inventory.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { CategoriesModule } from './categories/categories.module'; 
import { OrdersModule } from './orders/orders.module';
import { StockLog } from './stock-logs/stock-log.entity';
import { StockTransfer } from './transfers/stock-transfer.entity';
import { TransfersModule } from './transfers/transfers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ProfileModule } from './profile/profile.module';
import { SettingsModule } from './settings/settings.module';
import { Setting } from './settings/setting.entity';
import { PublicModule } from './public/public.module';
import { ProductImage } from './products/images/product-image.entity'; // <-- Import
import { AzampayModule } from './azampay/azampay.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT') ?? '5432', 10),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          User,
          Shop,
          Category,
          Product,
          Inventory,
          Order,
          OrderItem,
          StockLog,
          StockTransfer,
          Setting,
          ProductImage, // <-- Add it here
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ShopsModule,
    ProductsModule,
    InventoryModule,
    CategoriesModule,
    OrdersModule,
    TransfersModule,
    DashboardModule,
    ReportsModule,
    ProfileModule,
    SettingsModule,
    PublicModule,
    AzampayModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}