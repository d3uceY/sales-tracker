import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get summary cards data' })
  @ApiResponse({ status: 200, description: 'Summary cards data' })
  @Get('summary-cards')
  async getSummaryCards() {
    return this.dashboardService.getSummaryCards();
  }

  @ApiOperation({ summary: 'Get income vs expense data' })
  @ApiResponse({ status: 200, description: 'Income vs expense data' })
  @Get('income-expense')
  async getIncomeExpense() {
    return this.dashboardService.getIncomeExpense();
  }

  @ApiOperation({ summary: 'Get cashflow trend data' })
  @ApiResponse({ status: 200, description: 'Cashflow trend data' })
  @Get('cashflow')
  async getCashflowTrend() {
    return this.dashboardService.getCashflowTrend();
  }

  @ApiOperation({ summary: 'Get recent invoices' })
  @ApiResponse({ status: 200, description: 'Recent invoices' })
  @Get('recent-invoices')
  async getRecentInvoices() {
    return this.dashboardService.getRecentInvoices();
  }

  @ApiOperation({ summary: 'Get recent bills' })
  @ApiResponse({ status: 200, description: 'Recent bills' })
  @Get('recent-bills')
  async getRecentBills() {
    return this.dashboardService.getRecentBills();
  }
} 