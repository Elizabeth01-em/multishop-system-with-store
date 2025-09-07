import { IsDateString, IsOptional } from 'class-validator';

export class TopProductsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
