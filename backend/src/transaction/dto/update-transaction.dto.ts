import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ description: 'Item purchased', example: 'Laptop' })
  @IsOptional()
  @IsString()
  itemPurchased?: string;

  @ApiPropertyOptional({ description: 'Transaction date', example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ description: 'Reference number for invoice/bill', example: 'INV-2024-0001' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 2 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Price in NGN', example: 100000 })
  @IsOptional()
  @IsNumber()
  priceNGN?: number;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1500 })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiPropertyOptional({ description: 'Price in USD', example: 67 })
  @IsOptional()
  @IsNumber()
  priceUSD?: number;

  @ApiPropertyOptional({ description: 'Other expenses in USD', example: 5 })
  @IsOptional()
  @IsNumber()
  otherExpensesUSD?: number;

  @ApiPropertyOptional({ description: 'Other expenses in NGN', example: 7500 })
  @IsOptional()
  @IsNumber()
  otherExpensesNGN?: number;

  @ApiPropertyOptional({ description: 'Payment status', example: 'paid' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Total in NGN', example: 107500 })
  @IsOptional()
  @IsNumber()
  totalNGN?: number;

  @ApiPropertyOptional({ description: 'Total in USD', example: 72 })
  @IsOptional()
  @IsNumber()
  totalUSD?: number;

  @ApiPropertyOptional({ description: 'Amount paid', example: 100000 })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @ApiPropertyOptional({ description: 'Outstanding balance', example: 7500 })
  @IsOptional()
  @IsNumber()
  outstandingBalance?: number;

  @ApiPropertyOptional({ description: 'Soft delete timestamp', example: null })
  @IsOptional()
  @IsDateString()
  deletedAt?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'user-id' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'user-id' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
} 