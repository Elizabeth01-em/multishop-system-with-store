/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AzamPayService } from './azampay.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [AzamPayService],
  exports: [AzamPayService], // Export for other modules to use
})
export class AzampayModule {}