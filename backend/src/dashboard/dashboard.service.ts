import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryCardDto } from './dto/dashboard-summary-card.dto';
import { IncomeExpenseDto, IncomeExpenseTodayDto, IncomeExpenseMonthDto, IncomeExpenseTrendPointDto } from './dto/income-expense.dto';
import { CashflowChartPointDto } from './dto/cashflow-chart.dto';
import { RecentInvoiceDto } from './dto/recent-invoice.dto';
import { RecentBillDto } from './dto/recent-bill.dto';

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function getYearMonths(year: number) {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Summary cards: total customers, vendors, invoices, bills
  async getSummaryCards(): Promise<DashboardSummaryCardDto[]> {
    // Current totals
    const [
      totalCustomers,
      totalVendors,
      totalInvoices,
      totalBills,
      prevMonthInvoices,
      prevMonthBills
    ] = await Promise.all([
      this.prisma.customer.count({}),
      this.prisma.vendor.count({}),
      this.prisma.transaction.count({ where: { transactionType: 'customer' } }),
      this.prisma.transaction.count({ where: { transactionType: 'vendor' } }),
      // Previous month for change %
      this.prisma.transaction.count({
        where: {
          transactionType: 'customer',
          transactionDate: {
            gte: getMonthRange(new Date(new Date().getFullYear(), new Date().getMonth() - 1)).start,
            lt: getMonthRange(new Date(new Date().getFullYear(), new Date().getMonth() - 1)).end,
          },
        },
      }),
      this.prisma.transaction.count({
        where: {
          transactionType: 'vendor',
          transactionDate: {
            gte: getMonthRange(new Date(new Date().getFullYear(), new Date().getMonth() - 1)).start,
            lt: getMonthRange(new Date(new Date().getFullYear(), new Date().getMonth() - 1)).end,
          },
        },
      }),
    ]);

    // Calculate change % for invoices and bills
    function percentChange(current: number, prev: number) {
      if (prev === 0) return current === 0 ? '0%' : '+100%';
      const change = ((current - prev) / prev) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    }

    return [
      {
        title: 'Total Customers',
        value: formatNumber(totalCustomers),
        change: '',
        changeType: 'positive',
        icon: 'Users',
        color: 'blue',
      },
      {
        title: 'Total Vendors',
        value: formatNumber(totalVendors),
        change: '',
        changeType: 'positive',
        icon: 'Building2',
        color: 'green',
      },
      {
        title: 'Total Invoices',
        value: formatNumber(totalInvoices),
        change: percentChange(totalInvoices, prevMonthInvoices),
        changeType: totalInvoices >= prevMonthInvoices ? 'positive' : 'negative',
        icon: 'FileText',
        color: 'purple',
      },
      {
        title: 'Total Bills',
        value: formatNumber(totalBills),
        change: percentChange(totalBills, prevMonthBills),
        changeType: totalBills >= prevMonthBills ? 'positive' : 'negative',
        icon: 'Receipt',
        color: 'orange',
      },
    ];
  }

  // Income vs Expense: today, this month, net profit
  async getIncomeExpense(): Promise<IncomeExpenseDto> {
    // Today
    const { start: todayStart, end: todayEnd } = getTodayRange();
    // This month
    const { start: monthStart, end: monthEnd } = getMonthRange();

    // Income: sum of amountPaid for customer transactions
    // Expense: sum of amountPaid for vendor transactions
    // Net profit: income - expense
    const [
      todayCustomerAgg,
      todayVendorAgg,
      monthCustomerAgg,
      monthVendorAgg,
      // For trend chart (last 6 months)
      trendAgg
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          transactionType: 'customer',
          transactionDate: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amountPaid: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          transactionType: 'vendor',
          transactionDate: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amountPaid: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          transactionType: 'customer',
          transactionDate: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amountPaid: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          transactionType: 'vendor',
          transactionDate: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amountPaid: true },
      }),
      // Trend: last 6 months
      this.prisma.transaction.findMany({
        where: {
          transactionDate: {
            gte: getMonthRange(new Date(new Date().getFullYear(), new Date().getMonth() - 5)).start,
            lt: monthEnd,
          },
        },
        select: {
          transactionDate: true,
          transactionType: true,
          amountPaid: true,
        },
      }),
    ]);

    // Today
    const todayIncome = todayCustomerAgg._sum.amountPaid || 0;
    const todayExpense = todayVendorAgg._sum.amountPaid || 0;
    const todayNetProfit = todayIncome - todayExpense;
    // This month
    const monthIncome = monthCustomerAgg._sum.amountPaid || 0;
    const monthExpense = monthVendorAgg._sum.amountPaid || 0;
    const monthNetProfit = monthIncome - monthExpense;

    // Trend: group by month, sum income/expense
    const trendMap = new Map<string, { income: number; expense: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short' });
      trendMap.set(key, { income: 0, expense: 0 });
    }
    for (const txn of trendAgg) {
      const d = new Date(txn.transactionDate);
      const key = d.toLocaleString('default', { month: 'short' });
      if (!trendMap.has(key)) continue;
      if (txn.transactionType === 'customer') {
        trendMap.get(key)!.income += txn.amountPaid || 0;
      } else if (txn.transactionType === 'vendor') {
        trendMap.get(key)!.expense += txn.amountPaid || 0;
      }
    }
    const monthlyTrend: IncomeExpenseTrendPointDto[] = Array.from(trendMap.entries()).map(([month, { income, expense }]) => ({ month, income, expense }));

    return {
      today: { income: todayIncome, expense: todayExpense, netProfit: todayNetProfit },
      thisMonth: { income: monthIncome, expense: monthExpense, netProfit: monthNetProfit },
      monthlyTrend,
    };
  }

  // Cashflow chart: monthly trend for the year
  async getCashflowTrend(): Promise<CashflowChartPointDto[]> {
    const now = new Date();
    const year = now.getFullYear();
    const months = getYearMonths(year);
    // Get all transactions for this year
    const txns = await this.prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: {
        transactionDate: true,
        amountPaid: true,
      },
    });
    // Group by month
    const monthMap = new Map<string, number>();
    for (const m of months) {
      const key = m.toLocaleString('default', { month: 'short' });
      monthMap.set(key, 0);
    }
    for (const txn of txns) {
      const d = new Date(txn.transactionDate);
      const key = d.toLocaleString('default', { month: 'short' });
      if (monthMap.has(key)) {
        monthMap.set(key, monthMap.get(key)! + (txn.amountPaid || 0));
      }
    }
    return Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount }));
  }

  // Recent invoices (customer transactions)
  async getRecentInvoices(): Promise<RecentInvoiceDto[]> {
    const txns = await this.prisma.transaction.findMany({
      where: { transactionType: 'customer' },
      orderBy: { transactionDate: 'desc' },
      take: 5,
      include: { customer: true },
    });
    return txns.map((txn) => ({
      id: txn.id,
      customer: txn.customer?.name || '',
      issueDate: txn.transactionDate.toISOString().split('T')[0],
      dueDate: (txn as any).dueDate ? (txn as any).dueDate.toISOString().split('T')[0] : undefined,
      referenceNumber: (txn as any).referenceNumber || undefined,
      amount: txn.priceNGN,
      status: txn.paymentStatus,
    }));
  }

  // Recent bills (vendor transactions)
  async getRecentBills(): Promise<RecentBillDto[]> {
    const txns = await this.prisma.transaction.findMany({
      where: { transactionType: 'vendor' },
      orderBy: { transactionDate: 'desc' },
      take: 5,
      include: { vendor: true },
    });
    return txns.map((txn) => ({
      id: txn.id,
      vendor: txn.vendor?.name || '',
      billDate: txn.transactionDate.toISOString().split('T')[0],
      dueDate: (txn as any).dueDate ? (txn as any).dueDate.toISOString().split('T')[0] : undefined,
      referenceNumber: (txn as any).referenceNumber || undefined,
      amount: txn.priceUSD,
      status: txn.paymentStatus,
    }));
  }
} 