/* eslint-disable prettier/prettier */
// src/azampay/azampay.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/orders/order.entity';

interface AzamPayTokenResponse {
  data: {
    accessToken: string;
    expire: number;
  };
}

interface AzamPayCheckoutResponse {
  transactionId: string;
  // Add other properties as needed
}

interface AzamPayErrorResponse {
  data?: any;
  // Add other properties as needed
}

@Injectable()
export class AzamPayService {
    private readonly logger = new Logger(AzamPayService.name);
    private token: string;
    private tokenExpiry: Date;
    
    private readonly appName: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.appName = this.configService.get<string>('AZAMPAY_APP_NAME') || '';
        this.clientId = this.configService.get<string>('AZAMPAY_CLIENT_ID') || '';
        this.clientSecret = this.configService.get<string>('AZAMPAY_CLIENT_SECRET') || '';
        this.isProduction = this.configService.get<string>('AZAMPAY_ENV') === 'production';
    }

    private getBaseUrl(): string {
        return this.isProduction 
            ? 'https://authenticator.azampay.co.tz' 
            : 'https://authenticator-sandbox.azampay.co.tz';
    }

    private getApiUrl(): string {
        return this.isProduction 
            ? 'https://azampay.co.tz' 
            : 'https://sandbox.azampay.co.tz';
    }

    private async getAuthToken(): Promise<string> {
        if (this.token && new Date() < this.tokenExpiry) {
            return this.token;
        }

        const url = `${this.getBaseUrl()}/AppRegistration/GenerateToken`;
        try {
            const response = await firstValueFrom(
                this.httpService.post<AzamPayTokenResponse>(url, {
                    appName: this.appName,
                    clientId: this.clientId,
                    clientSecret: this.clientSecret,
                }),
            );

            this.token = response.data.data.accessToken;
            // Set expiry a little before the actual expiry time for safety
            const expiresIn = response.data.data.expire; // Assuming this is in seconds
            this.tokenExpiry = new Date(new Date().getTime() + (expiresIn - 60) * 1000);

            this.logger.log('New AzamPay Token Generated');
            return this.token;
        } catch (error: any) {
            const errorResponse = error as { response?: AzamPayErrorResponse };
            this.logger.error('Failed to generate AzamPay token', errorResponse.response?.data);
            throw new InternalServerErrorException('Could not authenticate with payment provider.');
        }
    }
    
    async initiateMnoCheckout(order: Order, accountNumber: string, provider: string): Promise<AzamPayCheckoutResponse> {
        const token = await this.getAuthToken();
        const url = `${this.getApiUrl()}/azampay/mno/checkout`;

        const payload = {
            accountNumber: accountNumber,
            amount: order.totalAmount,
            currency: 'TZS', // Assuming TZS
            externalId: order.externalId, // We will add this to Order entity
            provider: provider,
        };
        
        try {
            const response = await firstValueFrom(
                this.httpService.post<AzamPayCheckoutResponse>(url, payload, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            );
            
            this.logger.log(`Checkout initiated for Order ID ${order.id}. Transaction ID: ${response.data.transactionId}`);
            return response.data;
        } catch (error: any) {
            const errorResponse = error as { response?: AzamPayErrorResponse };
            this.logger.error(`Checkout failed for Order ID ${order.id}`, errorResponse.response?.data);
            throw new InternalServerErrorException('Payment initiation failed.');
        }
    }
}