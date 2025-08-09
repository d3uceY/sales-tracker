import { authAxios } from "./auth";

export const reportsApi = {
  // Get summary cards data (Total Revenue, Total Expenses, Net Profit, Active Customers)
  getSummaryCards: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter);
      if (params.customDateFrom) queryParams.append('customDateFrom', params.customDateFrom);
      if (params.customDateTo) queryParams.append('customDateTo', params.customDateTo);
      
      const response = await authAxios.get(`/reports/summary-cards?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary cards:', error);
      throw error;
    }
  },

  // Get sales summary (by item type and recent sales)
  getSalesSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter);
      if (params.customDateFrom) queryParams.append('customDateFrom', params.customDateFrom);
      if (params.customDateTo) queryParams.append('customDateTo', params.customDateTo);
      
      const response = await authAxios.get(`/reports/sales-summary?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  },

  // Get profit and loss report
  getProfitLoss: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter);
      if (params.customDateFrom) queryParams.append('customDateFrom', params.customDateFrom);
      if (params.customDateTo) queryParams.append('customDateTo', params.customDateTo);
      
      const response = await authAxios.get(`/reports/profit-loss?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profit loss:', error);
      throw error;
    }
  },

  // Get customer balances report
  getCustomerBalances: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      
      const response = await authAxios.get(`/reports/customer-balances?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer balances:', error);
      throw error;
    }
  },
}; 