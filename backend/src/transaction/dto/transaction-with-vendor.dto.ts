import { ApiProperty } from '@nestjs/swagger';

export class TransactionWithVendorDto {
  @ApiProperty() id: string;
  @ApiProperty() itemPurchased: string;
  @ApiProperty() transactionDate: string;
  @ApiProperty() quantity: number;
  @ApiProperty() amountUSD: number;
  @ApiProperty() exchangeRate: number;
  @ApiProperty() amountNGN: number;
  @ApiProperty() otherExpensesUSD: number;
  @ApiProperty() otherExpensesNGN: number;
  @ApiProperty() paymentStatus: string;
  @ApiProperty() totalUSD: number;
  @ApiProperty() totalNGN: number;
  @ApiProperty() amountPaid: number;
  @ApiProperty() previousBalance: number;
  @ApiProperty() outstandingBalance: number;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
  @ApiProperty({ example: 'Acme Supplies' }) vendorName: string;
} 