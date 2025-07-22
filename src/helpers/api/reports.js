import { authAxios } from "./auth";

export const reportsApi = {
  // Vendor Purchases Report
  getVendorPurchases: async (params) => {
    const response = await authAxios.get("/reports/vendor-purchases", { params });
    return response.data;
  },

  // Sales Summary Report
  getSalesSummary: async (params) => {
    const response = await authAxios.get("/reports/sales-summary", { params });
    return response.data;
  },

  // Profit & Loss Report
  getProfitLoss: async (params) => {
    const response = await authAxios.get("/reports/profit-loss", { params });
    return response.data;
  },

  // Outstanding Payments Report
  getOutstandingPayments: async (params) => {
    const response = await authAxios.get("/reports/outstanding-payments", { params });
    return response.data;
  },

  // Exchange Rate Report
  getExchangeRate: async (params) => {
    const response = await authAxios.get("/reports/exchange-rate", { params });
    return response.data;
  },

  // Customer Balance Report
  getCustomerBalances: async (params) => {
    const response = await authAxios.get("/reports/customer-balances", { params });
    return response.data;
  },
}; 