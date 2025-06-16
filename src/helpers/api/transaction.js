import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;


/* ============================
   API Helper function here for TRANSACTIONS
   ============================ */
   export const postTransaction = async (transactionData) => {
    const response = await axios.post(apiUrl + "/transactions", transactionData);
    return response;
  };
  
  export const getTransactions = async () => {
    const response = await axios.get(apiUrl + "/transactions");
    return response.data;
  };
  
  export const getTransaction = async (transactionId) => {
    const response = await axios.get(apiUrl + "/transactions/" + transactionId);
    return response.data;
  };
  
  export const updateTransaction = async (transactionId, transactionData) => {
    const response = await axios.put(
      apiUrl + "/transactions/" + transactionId,
      transactionData
    );
    return response.data;
  };
  
  export const deleteTransaction = async (transactionId) => {
    const response = await axios.delete(apiUrl + "/transactions/" + transactionId);
    return response.data;
  };
  
  