// src/reports/types.ts

export interface SalesByPeriodResult {
  date: string;
  totalRevenue: number;
}

export interface PerformanceByShopResult {
  shopName: string;
  totalRevenue: number;
  totalSalesCount: number;
  averageOrderValue: number;
}

export interface TopProductsResult {
  productName: string;
  uniqueProductCode: string;
  totalQuantitySold: number;
}
