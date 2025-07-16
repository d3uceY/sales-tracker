import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

// List customers with search, filter, and pagination
export const getCustomers = async (params) => {
  const response = await axios.get(`${apiUrl}/customers`, { params });
  return response.data;
};

// Create a new customer
export const createCustomer = async (customerData) => {
  const response = await axios.post(`${apiUrl}/customers`, customerData);
  return response.data;
};

// Get customer details with balance and transactions
export const getCustomer = async (id) => {
  const response = await axios.get(`${apiUrl}/customers/${id}`);
  return response.data;
};

// Update a customer
export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`${apiUrl}/customers/${id}`, customerData);
  return response.data;
};

// Delete a customer
export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${apiUrl}/customers/${id}`);
  return response.data;
};

// List transactions for a customer (with filters, pagination)
export const getCustomerTransactions = async (customerId, params) => {
  const response = await axios.get(`${apiUrl}/customers/${customerId}/transactions`, { params });
  return response.data;
};

// Create a transaction for a customer
export const createCustomerTransaction = async (customerId, transactionData) => {
  const response = await axios.post(`${apiUrl}/customers/${customerId}/transactions`, transactionData);
  return response.data;
}; 