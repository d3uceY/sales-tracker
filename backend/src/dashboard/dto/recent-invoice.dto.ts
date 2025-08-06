import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class RecentInvoiceDto {
  @ApiProperty({ example: 'INV-001' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Adebayo Electronics' })
  @IsString()
  customer: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsString()
  issueDate: string;

  @ApiProperty({ example: '2024-02-15', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ example: 'INV-2024-0001', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ example: 2500000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'paid' })
  @IsString()
  status: string;
} 