import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get customer balances (total purchased, paid, outstanding, etc.)
  async getCustomerBalances(status?: string) {
    // Get customers (optionally filter by status)
    const customers = await this.prisma.customer.findMany({
      where: status ? { status } : {},
      include: {
        transactions: true,
      },
    });
    const data = customers.map((customer) => {
      const totalPurchased = customer.transactions.reduce((acc, t) => acc + (t.totalUSD || 0), 0);
      const totalPaid = customer.transactions.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
      const outstandingBalance = customer.transactions.reduce((acc, t) => acc + (t.outstandingBalance || 0), 0);
      const lastTransactionDate = customer.transactions.length > 0 ? customer.transactions.reduce((latest, t) => new Date(t.transactionDate) > new Date(latest) ? t.transactionDate : latest, customer.transactions[0].transactionDate) : null;
      return {
        id: customer.id,
        customerName: customer.name,
        lastTransactionDate,
        totalTransactions: customer.transactions.length,
        totalPurchased,
        totalPaid,
        outstandingBalance,
        status: customer.status,
      };
    });
    // Summary totals
    const totalOutstanding = data.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const totalPurchased = data.reduce((sum, c) => sum + c.totalPurchased, 0);
    const totalPaid = data.reduce((sum, c) => sum + c.totalPaid, 0);
    const customersWithBalance = data.filter((c) => c.outstandingBalance > 0).length;
    return {
      data,
      summary: {
        totalOutstanding,
        totalPurchased,
        totalPaid,
        customersWithBalance,
      },
    };
  }

  /**
   * Get vendor purchase summary, breakdowns, and recent purchases
   */
  async getVendorPurchasesReport(query: any, user: any) {
    // Build date filter
    const where: any = { transactionType: 'vendor', deletedAt: null };
    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate);
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate);
    }
    // 1. Total vendors
    const vendorIds = await this.prisma.transaction.findMany({
      where,
      select: { vendorId: true },
      distinct: ['vendorId'],
    });
    const totalVendors = vendorIds.length;
    // 2. Total spent USD
    const totalSpentAgg = await this.prisma.transaction.aggregate({
      where,
      _sum: { priceUSD: true },
    });
    const totalSpentUSD = totalSpentAgg._sum.priceUSD || 0;
    // 3. Total unpaid USD
    const totalUnpaidAgg = await this.prisma.transaction.aggregate({
      where,
      _sum: { outstandingBalance: true },
    });
    const totalUnpaidUSD = totalUnpaidAgg._sum.outstandingBalance || 0;
    // 4. Top vendors by totalSpent (amountUSD)
    const topVendorAgg = await this.prisma.transaction.groupBy({
      by: ['vendorId'],
      where,
      _sum: { priceUSD: true, outstandingBalance: true },
      orderBy: { _sum: { priceUSD: 'desc' } },
      take: 5,
    });
    // Get vendor names
    const vendorIdsList = topVendorAgg.map(v => v.vendorId).filter((id): id is string => id !== null);
    const vendors = await this.prisma.vendor.findMany({
      where: { id: { in: vendorIdsList } },
      select: { id: true, name: true },
    });
    const vendorMap = Object.fromEntries(vendors.map(v => [v.id, v.name]));
    const topVendors = topVendorAgg.map(v => ({
      id: v.vendorId,
      name: v.vendorId ? vendorMap[v.vendorId] || '' : '',
      totalSpent: v._sum.priceUSD || 0,
      unpaid: v._sum.outstandingBalance || 0,
    }));
    // 5. Recent purchases
    const recentTxns = await this.prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: 10,
      include: { vendor: { select: { name: true } } },
    });
    const recentPurchases = recentTxns.map(txn => ({
      id: txn.id,
      vendorName: txn.vendor?.name || '',
      amountUSD: txn.priceUSD,
      transactionDate: txn.transactionDate,
      status: txn.paymentStatus,
    }));
    return {
      data: {
        totalVendors,
        totalSpentUSD,
        totalUnpaidUSD,
        topVendors,
        recentPurchases,
      },
    };
  }

  // Sales summary (by item, monthly, recent sales, etc.)
  async getSalesSummary(query: any, user: any) {
    // Build date filter
    const where: any = { transactionType: 'customer', deletedAt: null };
    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate);
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate);
    }

    // 1. Sales by item type
    const itemAgg = await this.prisma.transaction.groupBy({
      by: ['itemPurchased'],
      where,
      _sum: { priceNGN: true, priceUSD: true, quantity: true },
      _count: { _all: true },
    });
    const salesData = itemAgg.map(item => ({
      name: item.itemPurchased,
      value: item._sum.priceNGN || 0,
      usdValue: item._sum.priceUSD || 0,
      count: item._sum.quantity || 0,
    }));

    // 2. Monthly sales trend (group by month)
    const monthlyAgg = await this.prisma.transaction.groupBy({
      by: ['transactionDate'],
      where,
      _sum: { priceNGN: true, priceUSD: true },
    });
    
    // Group by year and month manually
    const monthlyMap = new Map<string, { ngn: number; usd: number }>();
    monthlyAgg.forEach(m => {
      const date = new Date(m.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { ngn: 0, usd: 0 };
      monthlyMap.set(monthKey, {
        ngn: existing.ngn + (m._sum.priceNGN || 0),
        usd: existing.usd + (m._sum.priceUSD || 0),
      });
    });
    
    const monthlySales = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ngn: data.ngn,
        usd: data.usd,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 3. Recent sales (last 10)
    const recentTxns = await this.prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: 10,
      include: { customer: { select: { name: true } } },
    });
    const recentSales = recentTxns.map(txn => ({
      id: txn.id,
      customer: txn.customer?.name || '',
      item: txn.itemPurchased,
      amount: txn.priceNGN,
      usdAmount: txn.priceUSD,
      date: txn.transactionDate,
      status: txn.paymentStatus,
    }));

    return {
      data: {
        salesData,
        monthlySales,
        recentSales,
      },
    };
  }

  // Profit and loss report
  async getProfitLoss(query: any, user: any) {
    // Build date filter
    const dateFilter: any = {};
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate) dateFilter.lte = new Date(query.endDate);

    // 1. Monthly income (customer transactions)
    const incomeAgg = await this.prisma.transaction.groupBy({
      by: ['transactionDate'],
      where: {
        transactionType: 'customer',
        deletedAt: null,
        ...(Object.keys(dateFilter).length ? { transactionDate: dateFilter } : {}),
      },
      _sum: { priceNGN: true, priceUSD: true },
    });
    
    // 2. Monthly expenses (vendor transactions)
    const expenseAgg = await this.prisma.transaction.groupBy({
      by: ['transactionDate'],
      where: {
        transactionType: 'vendor',
        deletedAt: null,
        ...(Object.keys(dateFilter).length ? { transactionDate: dateFilter } : {}),
      },
      _sum: { priceNGN: true, priceUSD: true },
    });
    
    // Merge by year/month manually
    const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthly: Record<string, any> = {};
    
    for (const i of incomeAgg) {
      const key = monthKey(i.transactionDate);
      monthly[key] = {
        month: key,
        income: i._sum.priceNGN || 0,
        incomeUSD: i._sum.priceUSD || 0,
        expenses: 0,
        expensesUSD: 0,
      };
    }
    
    for (const e of expenseAgg) {
      const key = monthKey(e.transactionDate);
      if (!monthly[key]) monthly[key] = { month: key, income: 0, incomeUSD: 0, expenses: 0, expensesUSD: 0 };
      monthly[key].expenses = e._sum.priceNGN || 0;
      monthly[key].expensesUSD = e._sum.priceUSD || 0;
    }
    
    // Calculate profit and profitUSD
    for (const m of Object.values(monthly)) {
      m.profit = m.income - m.expenses;
      m.profitUSD = m.incomeUSD - m.expensesUSD;
    }
    
    // Sort by month
    const monthlyProfitLoss = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

    // 3. Current month summary
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
    const current = monthly[thisMonth] || { income: 0, expenses: 0, profit: 0, incomeUSD: 0, expensesUSD: 0, profitUSD: 0 };
    const previous = monthly[prevMonth] || { profit: 0, profitUSD: 0 };
    const profitMargin = current.income ? (current.profit / current.income) * 100 : 0;
    const currentMonth = {
      totalIncome: current.income,
      totalExpenses: current.expenses,
      netProfit: current.profit,
      totalIncomeUSD: current.incomeUSD,
      totalExpensesUSD: current.expensesUSD,
      netProfitUSD: current.profitUSD,
      profitMargin: Number(profitMargin.toFixed(1)),
      previousMonth: {
        netProfit: previous.profit,
        netProfitUSD: previous.profitUSD,
      },
    };

    // 4. Expense breakdown by itemPurchased (category)
    const expenseBreakdownAgg = await this.prisma.transaction.groupBy({
      by: ['itemPurchased'],
      where: {
        transactionType: 'vendor',
        deletedAt: null,
        ...(Object.keys(dateFilter).length ? { transactionDate: dateFilter } : {}),
      },
      _sum: { priceNGN: true, priceUSD: true },
    });
    const totalExpenses = expenseBreakdownAgg.reduce((sum, e) => sum + (e._sum.priceNGN || 0), 0);
    const expenseBreakdown = expenseBreakdownAgg.map(e => ({
      category: e.itemPurchased,
      amount: e._sum.priceNGN || 0,
      usd: e._sum.priceUSD || 0,
      percentage: totalExpenses ? Number(((e._sum.priceNGN || 0) / totalExpenses * 100).toFixed(1)) : 0,
    }));

    return {
      data: {
        monthlyProfitLoss,
        currentMonth,
        expenseBreakdown,
      },
    };
  }

  // Outstanding payments (unpaid/overdue bills and payments)
  async getOutstandingPayments(query: any, user: any) {
    const today = new Date();
    // Vendor bills
    const vendorTxns = await this.prisma.transaction.findMany({
      where: {
        transactionType: 'vendor',
        deletedAt: null,
        outstandingBalance: { gt: 0 },
        ...(query.startDate || query.endDate ? {
          transactionDate: {
            ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
            ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
          },
        } : {}),
      },
      include: { vendor: { select: { name: true } } },
    });
    const unpaidVendorBills = vendorTxns.map(txn => {
      // Removed dueDate logic since dueDate field no longer exists
      const status = 'outstanding';
      return {
        id: txn.id,
        vendor: txn.vendor?.name || '',
        item: txn.itemPurchased,
        amount: txn.priceUSD,
        ngn: txn.priceNGN,
        daysOverdue: 0,
        status,
      };
    });
    // Customer payments
    const customerTxns = await this.prisma.transaction.findMany({
      where: {
        transactionType: 'customer',
        deletedAt: null,
        outstandingBalance: { gt: 0 },
        ...(query.startDate || query.endDate ? {
          transactionDate: {
            ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
            ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
          },
        } : {}),
      },
      include: { customer: { select: { name: true } } },
    });
    const unpaidCustomerPayments = customerTxns.map(txn => {
      // Removed dueDate logic since dueDate field no longer exists
      const status = 'outstanding';
      return {
        id: txn.id,
        customer: txn.customer?.name || '',
        item: txn.itemPurchased,
        amount: txn.priceNGN,
        usd: txn.priceUSD,
        daysOverdue: 0,
        status,
      };
    });
    return {
      data: {
        unpaidVendorBills,
        unpaidCustomerPayments,
      },
    };
  }
} 