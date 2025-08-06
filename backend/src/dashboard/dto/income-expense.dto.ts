import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray } from 'class-validator';

export class IncomeExpenseTodayDto {
  @ApiProperty({ example: 12450 })
  @IsNumber()
  income: number;

  @ApiProperty({ example: 8230 })
  @IsNumber()
  expense: number;

  @ApiProperty({ example: 4220 })
  @IsNumber()
  netProfit: number;
}

export class IncomeExpenseMonthDto {
  @ApiProperty({ example: 125000 })
  @IsNumber()
  income: number;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  expense: number;

  @ApiProperty({ example: 40000 })
  @IsNumber()
  netProfit: number;
}

export class IncomeExpenseTrendPointDto {
  @ApiProperty({ example: 'Jan' })
  @IsString()
  month: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  income: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  expense: number;
}

export class IncomeExpenseDto {
  @ApiProperty({ type: IncomeExpenseTodayDto })
  today: IncomeExpenseTodayDto;

  @ApiProperty({ type: IncomeExpenseMonthDto })
  thisMonth: IncomeExpenseMonthDto;

  @ApiProperty({ type: [IncomeExpenseTrendPointDto] })
  monthlyTrend: IncomeExpenseTrendPointDto[];
} 