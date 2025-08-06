import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class RecentBillDto {
  @ApiProperty({ example: 'BILL-001' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Amazon US' })
  @IsString()
  vendor: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsString()
  billDate: string;

  @ApiProperty({ example: '2024-02-15', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ example: 'BILL-2024-0001', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'paid' })
  @IsString()
  status: string;
} 