import { authAxios } from "./auth";

// Dummy data generators
const generateSalesData = () => {
  const salesData = [
    { name: "Electronics", value: 18500000, count: 45, usdValue: 11212121 },
    { name: "Clothing", value: 12500000, count: 120, usdValue: 7575758 },
    { name: "Home & Garden", value: 8500000, count: 67, usdValue: 5151515 },
    { name: "Sports & Outdoors", value: 5750000, count: 38, usdValue: 3484848 }
  ];

  const monthlySales = [
    { month: "Jan", ngn: 12500000, usd: 7575758 },
    { month: "Feb", ngn: 13800000, usd: 8363636 },
    { month: "Mar", ngn: 15200000, usd: 9212121 },
    { month: "Apr", ngn: 14500000, usd: 8787879 },
    { month: "May", ngn: 16800000, usd: 10181818 },
    { month: "Jun", ngn: 18200000, usd: 11030303 },
    { month: "Jul", ngn: 19500000, usd: 11818182 },
    { month: "Aug", ngn: 17800000, usd: 10787879 },
    { month: "Sep", ngn: 16500000, usd: 10000000 },
    { month: "Oct", ngn: 18900000, usd: 11454545 },
    { month: "Nov", ngn: 20300000, usd: 12303030 },
    { month: "Dec", ngn: 45250000, usd: 27424242 }
  ];

  const recentSales = [
    { id: 1, customer: "John Smith", item: "iPhone 15 Pro", date: "2024-01-15", amount: 850000, usdAmount: 515152, status: "paid" },
    { id: 2, customer: "Sarah Johnson", item: "Samsung TV 55\"", date: "2024-01-14", amount: 650000, usdAmount: 393939, status: "paid" },
    { id: 3, customer: "Mike Wilson", item: "Nike Running Shoes", date: "2024-01-13", amount: 45000, usdAmount: 27273, status: "pending" },
    { id: 4, customer: "Lisa Brown", item: "Garden Tool Set", date: "2024-01-12", amount: 125000, usdAmount: 75758, status: "paid" },
    { id: 5, customer: "David Lee", item: "Wireless Headphones", date: "2024-01-11", amount: 75000, usdAmount: 45455, status: "paid" }
  ];

  return { salesData, monthlySales, recentSales };
};

const generateVendorPurchases = () => {
  const topVendors = [
    { name: "Tech Solutions Ltd", totalSpent: 125000, unpaid: 25000, items: 45 },
    { name: "Global Imports Co", totalSpent: 98000, unpaid: 15000, items: 32 },
    { name: "Electronics World", totalSpent: 75000, unpaid: 0, items: 28 },
    { name: "Fashion Forward", totalSpent: 62000, unpaid: 8000, items: 55 },
    { name: "Home Essentials", totalSpent: 48000, unpaid: 12000, items: 23 }
  ];

  const recentPurchases = [
    { id: 1, vendorName: "Tech Solutions Ltd", itemPurchased: "Smartphones", amountUSD: 15000, exchangeRate: 1650, transactionDate: "2024-01-15", status: "paid" },
    { id: 2, vendorName: "Global Imports Co", itemPurchased: "Laptops", amountUSD: 12000, exchangeRate: 1650, transactionDate: "2024-01-14", status: "pending" },
    { id: 3, vendorName: "Electronics World", itemPurchased: "Tablets", amountUSD: 8500, exchangeRate: 1650, transactionDate: "2024-01-13", status: "paid" },
    { id: 4, vendorName: "Fashion Forward", itemPurchased: "Clothing Items", amountUSD: 6800, exchangeRate: 1650, transactionDate: "2024-01-12", status: "paid" },
    { id: 5, vendorName: "Home Essentials", itemPurchased: "Kitchen Appliances", amountUSD: 5200, exchangeRate: 1650, transactionDate: "2024-01-11", status: "pending" }
  ];

  const itemBreakdown = [
    { item: "Smartphones", amount: 45000, count: 150, avgPrice: 300 },
    { item: "Laptops", amount: 38000, count: 95, avgPrice: 400 },
    { item: "Tablets", amount: 25000, count: 125, avgPrice: 200 },
    { item: "Clothing", amount: 18000, count: 900, avgPrice: 20 },
    { item: "Kitchen Appliances", amount: 12000, count: 60, avgPrice: 200 }
  ];

  return { topVendors, recentPurchases, itemBreakdown };
};

const generateProfitLoss = () => {
  const monthlyProfitLoss = [
    { month: "Jan", income: 12500000, incomeUSD: 7575758, expenses: 8500000, expensesUSD: 5151515, profit: 4000000, profitUSD: 2424242 },
    { month: "Feb", income: 13800000, incomeUSD: 8363636, expenses: 9200000, expensesUSD: 5575758, profit: 4600000, profitUSD: 2787879 },
    { month: "Mar", income: 15200000, incomeUSD: 9212121, expenses: 9800000, expensesUSD: 5939394, profit: 5400000, profitUSD: 3272727 },
    { month: "Apr", income: 14500000, incomeUSD: 8787879, expenses: 10200000, expensesUSD: 6181818, profit: 4300000, profitUSD: 2606061 },
    { month: "May", income: 16800000, incomeUSD: 10181818, expenses: 10800000, expensesUSD: 6545455, profit: 6000000, profitUSD: 3636364 },
    { month: "Jun", income: 18200000, incomeUSD: 11030303, expenses: 11500000, expensesUSD: 6969697, profit: 6700000, profitUSD: 4060606 },
    { month: "Jul", income: 19500000, incomeUSD: 11818182, expenses: 12200000, expensesUSD: 7393939, profit: 7300000, profitUSD: 4424242 },
    { month: "Aug", income: 17800000, incomeUSD: 10787879, expenses: 11800000, expensesUSD: 7151515, profit: 6000000, profitUSD: 3636364 },
    { month: "Sep", income: 16500000, incomeUSD: 10000000, expenses: 11200000, expensesUSD: 6787879, profit: 5300000, profitUSD: 3212121 },
    { month: "Oct", income: 18900000, incomeUSD: 11454545, expenses: 12500000, expensesUSD: 7575758, profit: 6400000, profitUSD: 3878788 },
    { month: "Nov", income: 20300000, incomeUSD: 12303030, expenses: 13200000, expensesUSD: 8000000, profit: 7100000, profitUSD: 4303030 },
    { month: "Dec", income: 45250000, incomeUSD: 27424242, expenses: 32180000, expensesUSD: 19503030, profit: 13070000, profitUSD: 7921212 }
  ];

  const currentMonth = {
    totalIncome: 45250000,
    totalIncomeUSD: 27424242,
    totalExpenses: 32180000,
    totalExpensesUSD: 19503030,
    netProfit: 13070000,
    netProfitUSD: 7921212,
    previousMonth: {
      netProfit: 7100000
    }
  };

  const expenseBreakdown = [
    { category: "Inventory", amount: 18500000, usd: 11212121, percentage: 57.5 },
    { category: "Operating Expenses", amount: 6800000, usd: 4121212, percentage: 21.1 },
    { category: "Marketing", amount: 3200000, usd: 1939394, percentage: 9.9 },
    { category: "Salaries", amount: 2200000, usd: 1333333, percentage: 6.8 },
    { category: "Utilities", amount: 980000, usd: 593939, percentage: 3.0 },
    { category: "Other", amount: 800000, usd: 484848, percentage: 2.5 }
  ];

  return { monthlyProfitLoss, currentMonth, expenseBreakdown };
};

const generateOutstandingPayments = () => {
  return {
    unpaidVendorBills: [
      { id: 1, vendor: "Tech Solutions Ltd", item: "Smartphones", dueDate: "2024-01-20", amount: 25000, ngn: 41250000, status: "due", daysOverdue: 0 },
      { id: 2, vendor: "Global Imports Co", item: "Laptops", dueDate: "2024-01-15", amount: 15000, ngn: 24750000, status: "overdue", daysOverdue: 5 },
      { id: 3, vendor: "Electronics World", item: "Tablets", dueDate: "2024-01-18", amount: 8500, ngn: 14025000, status: "due", daysOverdue: 0 },
      { id: 4, vendor: "Fashion Forward", item: "Clothing Items", dueDate: "2024-01-12", amount: 8000, ngn: 13200000, status: "overdue", daysOverdue: 8 },
      { id: 5, vendor: "Home Essentials", item: "Kitchen Appliances", dueDate: "2024-01-10", amount: 12000, ngn: 19800000, status: "overdue", daysOverdue: 10 }
    ],
    unpaidCustomerPayments: [
      { id: 1, customer: "ABC Company Ltd", item: "iPhone 15 Pro", dueDate: "2024-01-25", amount: 700000, usd: 424242, status: "due", daysOverdue: 0 },
      { id: 2, customer: "XYZ Corporation", item: "Samsung TV 55\"", dueDate: "2024-01-20", amount: 600000, usd: 363636, status: "due", daysOverdue: 0 },
      { id: 3, customer: "Global Industries", item: "Garden Tool Set", dueDate: "2024-01-15", amount: 950000, usd: 575758, status: "overdue", daysOverdue: 5 },
      { id: 4, customer: "Premium Services", item: "Wireless Headphones", dueDate: "2024-01-18", amount: 700000, usd: 424242, status: "due", daysOverdue: 0 },
      { id: 5, customer: "Startup Ventures", item: "Nike Running Shoes", dueDate: "2024-01-12", amount: 950000, usd: 575758, status: "overdue", daysOverdue: 8 }
    ]
  };
};

const generateExchangeRate = () => {
  const exchangeRateData = [
    { date: "2024-01-01", rate: 1620, buyRate: 1615, sellRate: 1625 },
    { date: "2024-01-02", rate: 1625, buyRate: 1620, sellRate: 1630 },
    { date: "2024-01-03", rate: 1630, buyRate: 1625, sellRate: 1635 },
    { date: "2024-01-04", rate: 1628, buyRate: 1623, sellRate: 1633 },
    { date: "2024-01-05", rate: 1635, buyRate: 1630, sellRate: 1640 },
    { date: "2024-01-06", rate: 1640, buyRate: 1635, sellRate: 1645 },
    { date: "2024-01-07", rate: 1638, buyRate: 1633, sellRate: 1643 },
    { date: "2024-01-08", rate: 1642, buyRate: 1637, sellRate: 1647 },
    { date: "2024-01-09", rate: 1645, buyRate: 1640, sellRate: 1650 },
    { date: "2024-01-10", rate: 1650, buyRate: 1645, sellRate: 1655 },
    { date: "2024-01-11", rate: 1652, buyRate: 1647, sellRate: 1657 },
    { date: "2024-01-12", rate: 1655, buyRate: 1650, sellRate: 1660 },
    { date: "2024-01-13", rate: 1658, buyRate: 1653, sellRate: 1663 },
    { date: "2024-01-14", rate: 1660, buyRate: 1655, sellRate: 1665 },
    { date: "2024-01-15", rate: 1650, buyRate: 1645, sellRate: 1655 }
  ];

  const rateAnalysis = {
    currentRate: 1650,
    change: 30,
    changePercent: 1.85,
    averageRate: 1642,
    volatility: "Medium"
  };

  const profitMarginAnalysis = [
    { rate: 1620, margin: 25.5, profit: 8500000 },
    { rate: 1625, margin: 26.2, profit: 8700000 },
    { rate: 1630, margin: 26.8, profit: 8900000 },
    { rate: 1628, margin: 26.5, profit: 8800000 },
    { rate: 1635, margin: 27.1, profit: 9000000 },
    { rate: 1640, margin: 27.5, profit: 9200000 },
    { rate: 1638, margin: 27.3, profit: 9100000 },
    { rate: 1642, margin: 27.8, profit: 9300000 },
    { rate: 1645, margin: 28.0, profit: 9400000 },
    { rate: 1650, margin: 28.3, profit: 9500000 },
    { rate: 1652, margin: 28.5, profit: 9600000 },
    { rate: 1655, margin: 28.8, profit: 9700000 },
    { rate: 1658, margin: 29.0, profit: 9800000 },
    { rate: 1660, margin: 29.2, profit: 9900000 }
  ];

  return { exchangeRateData, rateAnalysis, profitMarginAnalysis };
};

const generateCustomerBalances = () => {
  const customers = [
    { 
      id: 1, 
      customerName: "ABC Company Ltd", 
      totalPurchased: 8500000, 
      totalPaid: 7800000, 
      outstandingBalance: 700000, 
      lastTransactionDate: "2024-01-15", 
      totalTransactions: 45,
      status: "active" 
    },
    { 
      id: 2, 
      customerName: "XYZ Corporation", 
      totalPurchased: 6200000, 
      totalPaid: 5600000, 
      outstandingBalance: 600000, 
      lastTransactionDate: "2024-01-14", 
      totalTransactions: 32,
      status: "active" 
    },
    { 
      id: 3, 
      customerName: "Tech Solutions Inc", 
      totalPurchased: 12500000, 
      totalPaid: 12500000, 
      outstandingBalance: 0, 
      lastTransactionDate: "2024-01-15", 
      totalTransactions: 67,
      status: "active" 
    },
    { 
      id: 4, 
      customerName: "Global Industries", 
      totalPurchased: 3200000, 
      totalPaid: 2250000, 
      outstandingBalance: 950000, 
      lastTransactionDate: "2024-01-10", 
      totalTransactions: 18,
      status: "inactive" 
    },
    { 
      id: 5, 
      customerName: "Local Business Co", 
      totalPurchased: 4800000, 
      totalPaid: 4800000, 
      outstandingBalance: 0, 
      lastTransactionDate: "2024-01-12", 
      totalTransactions: 28,
      status: "active" 
    },
    { 
      id: 6, 
      customerName: "Premium Services", 
      totalPurchased: 7500000, 
      totalPaid: 6800000, 
      outstandingBalance: 700000, 
      lastTransactionDate: "2024-01-13", 
      totalTransactions: 39,
      status: "active" 
    },
    { 
      id: 7, 
      customerName: "Enterprise Solutions", 
      totalPurchased: 9800000, 
      totalPaid: 9200000, 
      outstandingBalance: 600000, 
      lastTransactionDate: "2024-01-11", 
      totalTransactions: 52,
      status: "active" 
    },
    { 
      id: 8, 
      customerName: "Startup Ventures", 
      totalPurchased: 2100000, 
      totalPaid: 1150000, 
      outstandingBalance: 950000, 
      lastTransactionDate: "2024-01-08", 
      totalTransactions: 12,
      status: "inactive" 
    }
  ];

  const summary = {
    totalCustomers: customers.length,
    totalOutstanding: customers.reduce((sum, c) => sum + c.outstandingBalance, 0),
    totalPurchased: customers.reduce((sum, c) => sum + c.totalPurchased, 0),
    totalPaid: customers.reduce((sum, c) => sum + c.totalPaid, 0)
  };

  return { data: customers, summary };
};

export const reportsApi = {
  // Vendor Purchases Report
  getVendorPurchases: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: generateVendorPurchases() };
  },

  // Sales Summary Report
  getSalesSummary: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: generateSalesData() };
  },

  // Profit & Loss Report
  getProfitLoss: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: generateProfitLoss() };
  },

  // Outstanding Payments Report
  getOutstandingPayments: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: generateOutstandingPayments() };
  },

  // Exchange Rate Report
  getExchangeRate: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: generateExchangeRate() };
  },

  // Customer Balance Report
  getCustomerBalances: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateCustomerBalances();
  },
}; 