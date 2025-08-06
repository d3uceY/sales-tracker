import { ApiProperty } from '@nestjs/swagger';

export class VendorResponseDto {
  @ApiProperty({ example: '64e8b7c2f1a2b3c4d5e6f7a8' })
  id: string;

  @ApiProperty({ example: 'Acme Supplies' })
  name: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-10T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 10000, description: 'Total amount spent with this vendor (USD)' })
  totalSpent: number;

  @ApiProperty({ example: 2000, description: 'Total unpaid amount (USD)' })
  totalUnpaid: number;

  @ApiProperty({ example: 15, description: 'Number of transactions' })
  transactionCount: number;

  @ApiProperty({ type: [Object], description: 'Recent transactions' })
  recentTransactions: any[];
} 