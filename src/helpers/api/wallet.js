import { authAxios } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const walletApi = {
  async getBalance() {
    try {
      const res = await authAxios.get(`/cash-wallet/balance`);
      console.log('getBalance response:', res.data);
      return res.data;
    } catch (error) {
      console.error('getBalance error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getSummary() {
    try {
      const res = await authAxios.get(`/cash-wallet/summary`);
      console.log('getSummary response:', res.data);
      return res.data;
    } catch (error) {
      console.error('getSummary error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getTransactions(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `/cash-wallet${params ? `?${params}` : ''}`;
      const res = await authAxios.get(url);
      console.log('getTransactions response:', res.data);
      return res.data;
    } catch (error) {
      console.error('getTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  async addTransaction(transactionData) {
    try {
      const res = await authAxios.post(`/cash-wallet`, transactionData);
      console.log('addTransaction response:', res.data);
      return res.data;
    } catch (error) {
      console.error('addTransaction error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateTransaction(id, updates) {
    try {
      const res = await authAxios.put(`/cash-wallet/${id}`, updates);
      console.log('updateTransaction response:', res.data);
      return res.data;
    } catch (error) {
      console.error('updateTransaction error:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      const res = await authAxios.delete(`/cash-wallet/${id}`);
      console.log('deleteTransaction response:', res.data);
      return res.data;
    } catch (error) {
      console.error('deleteTransaction error:', error.response?.data || error.message);
      throw error;
    }
  }
};
