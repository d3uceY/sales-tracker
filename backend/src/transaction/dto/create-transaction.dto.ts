import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';

export { CreateCustomerTransactionDto as CreateTransactionDto };

export class CreateCustomerTransactionDto {
  @ApiProperty({ description: 'Item purchased', example: 'Laptop' })
  @IsString()
  itemPurchased: string;

  @ApiProperty({ description: 'Transaction date', example: '2024-01-01T00:00:00.000Z' })
  transactionDate: string;

  @ApiPropertyOptional({ description: 'Reference number for invoice/bill', example: 'INV-2024-0001' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Price in NGN', example: 100000 })
  @IsNumber()
  priceNGN: number;

  @ApiProperty({ description: 'Exchange rate', example: 1500 })
  @IsNumber()
  exchangeRate: number;

  @ApiProperty({ description: 'Price in USD', example: 67 })
  @IsNumber()
  priceUSD: number;

  @ApiPropertyOptional({ description: 'Other expenses in USD', example: 5 })
  @IsOptional()
  @IsNumber()
  otherExpensesUSD?: number;

  @ApiPropertyOptional({ description: 'Other expenses in NGN', example: 7500 })
  @IsOptional()
  @IsNumber()
  otherExpensesNGN?: number;

  @ApiProperty({ description: 'Payment status', example: 'paid' })
  @IsString()
  paymentStatus: string;

  @ApiProperty({ description: 'Total in NGN', example: 107500 })
  @IsNumber()
  totalNGN: number;

  @ApiProperty({ description: 'Total in USD', example: 72 })
  @IsNumber()
  totalUSD: number;

  @ApiProperty({ description: 'Amount paid', example: 100000 })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ description: 'Outstanding balance', example: 7500 })
  @IsNumber()
  outstandingBalance: number;

  @ApiHideProperty()
  vendorId?: null;

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