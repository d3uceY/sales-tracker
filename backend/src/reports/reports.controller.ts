import { Controller, Get, UseGuards, Req, Query, Body, Put } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get vendor purchase summary, breakdowns, and recent purchases' })
  @ApiResponse({
    status: 200,
    description: 'Vendor purchase report',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            totalVendors: { type: 'number', example: 10 },
            totalSpentUSD: { type: 'number', example: 50000 },
            totalUnpaidUSD: { type: 'number', example: 8000 },
            topVendors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '64e8b7c2f1a2b3c4d5e6f7a8' },
                  name: { type: 'string', example: 'Acme Supplies' },
                  totalSpent: { type: 'number', example: 12000 },
                  unpaid: { type: 'number', example: 2000 },
                },
              },
            },
            recentPurchases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'txn123' },
                  vendorName: { type: 'string', example: 'Acme Supplies' },
                  amountUSD: { type: 'number', example: 500 },
                  transactionDate: { type: 'string', example: '2024-06-10T12:00:00.000Z' },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('vendor-purchases')
  async getVendorPurchases(@Req() req, @Query() query) {
    // TODO: Implement real logic in service
    return this.reportsService.getVendorPurchasesReport(query, req.user);
  }

  @ApiOperation({ summary: 'Get sales summary (by item, monthly, recent sales, etc.)' })
  @ApiResponse({ status: 200, description: 'Sales summary report' })
  @Get('sales-summary')
  async getSalesSummary(@Req() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getSalesSummary(query, req.user);
  }

  @ApiOperation({ summary: 'Get profit and loss report' })
  @ApiResponse({ status: 200, description: 'Profit and loss report' })
  @Get('profit-loss')
  async getProfitLoss(@Req() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getProfitLoss(query, req.user);
  }

  @ApiOperation({ summary: 'Get customer balances summary' })
  @ApiResponse({ status: 200, description: 'Customer balances report' })
  @Get('customer-balances')
  async getCustomerBalances(@Req() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getCustomerBalances(query.status);
  }

  @ApiOperation({ summary: 'Get outstanding payments (unpaid/overdue bills and payments)' })
  @ApiResponse({ status: 200, description: 'Outstanding payments report' })
  @Get('outstanding-payments')
  async getOutstandingPayments(@Req() req, @Query() query: ReportQueryDto) {
    return this.reportsService.getOutstandingPayments(query, req.user);
  }
} 