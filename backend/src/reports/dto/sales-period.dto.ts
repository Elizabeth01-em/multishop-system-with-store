import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export enum SalesPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class SalesPeriodDto {
  @IsEnum(SalesPeriod)
  @IsOptional()
  period?: SalesPeriod = SalesPeriod.DAILY;

  @IsString()
  @IsIn(['7d', '30d', '90d', '1y'])
  @IsOptional()
  range?: string = '30d';
}
