import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CashflowChartPointDto {
  @ApiProperty({ example: 'Jan' })
  @IsString()
  month: string;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  amount: number;
} 