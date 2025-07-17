import axios from "axios";
import { authAxios } from "./auth";
const apiUrl = import.meta.env.VITE_API_URL;

/* ============================
   API Helper function here for TRANSACTIONS
   ============================ */
export const postTransaction = async (transactionData) => {
  const response = await authAxios.post("/transactions", transactionData);
  return response;
};

export const getTransactions = async () => {
  const response = await authAxios.get("/transactions");
  return response.data;
};

export const getTransaction = async (transactionId) => {
  const response = await authAxios.get(`/transactions/${transactionId}`);
  return response.data;
};

export const updateTransaction = async (transactionId, transactionData) => {
  const response = await authAxios.put(
    `/transactions/${transactionId}`,
    transactionData
  );
  return response.data;
};

export const deleteTransaction = async (transactionId) => {
  const response = await authAxios.delete(`/transactions/${transactionId}`);
  return response.data;
};
  
  