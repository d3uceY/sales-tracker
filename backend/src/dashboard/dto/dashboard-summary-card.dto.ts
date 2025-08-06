import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class DashboardSummaryCardDto {
  @ApiProperty({ example: 'Total Customers' })
  @IsString()
  title: string;

  @ApiProperty({ example: '1,234' })
  @IsString()
  value: string;

  @ApiProperty({ example: '+12%' })
  @IsString()
  change: string;

  @ApiProperty({ example: 'positive' })
  @IsString()
  changeType: string;

  @ApiProperty({ example: 'Users' })
  @IsString()
  icon: string;

  @ApiProperty({ example: 'blue' })
  @IsString()
  color: string;
} 