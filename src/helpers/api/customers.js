import axios from "axios";
import { authAxios } from "./auth";
const apiUrl = import.meta.env.VITE_API_URL;

// List customers with search, filter, and pagination
export const getCustomers = async (params) => {
  const response = await authAxios.get(`/customers`, { params });
  return response.data;
};

// Create a new customer
export const createCustomer = async (customerData) => {
  const response = await authAxios.post(`/customers`, customerData);
  return response.data;
};

// Get customer details with balance and transactions
export const getCustomer = async (id) => {
  const response = await authAxios.get(`/customers/${id}`);
  return response.data;
};

// Update a customer
export const updateCustomer = async (id, customerData) => {
  const response = await authAxios.put(`/customers/${id}`, customerData);
  return response.data;
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const response = await authAxios.delete(`/customers/${id}`);
  return response.data;
};

// List transactions for a customer (with filters, pagination)
export const getCustomerTransactions = async (customerId, params) => {
  const response = await authAxios.get(`/customers/${customerId}/transactions`, { params });
  return response.data;
};

// Create a transaction for a customer
export const createCustomerTransaction = async (customerId, transactionData) => {
  const response = await authAxios.post(`/customers/${customerId}/transactions`, transactionData);
  return response.data;
}; 