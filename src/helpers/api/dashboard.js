import { authAxios } from "./auth";

export const dashboardApi = {
  getSummaryCards: async () => {
    const response = await authAxios.get("/dashboard/summary-cards");
    return response.data;
  },
  getIncomeExpense: async () => {
    const response = await authAxios.get("/dashboard/income-expense");
    return response.data;
  },
  getCashflowTrend: async () => {
    const response = await authAxios.get("/dashboard/cashflow");
    return response.data;
  },
  getRecentInvoices: async () => {
    const response = await authAxios.get("/dashboard/recent-invoices");
    return response.data;
  },
  getRecentBills: async () => {
    const response = await authAxios.get("/dashboard/recent-bills");
    return response.data;
  },
}; 