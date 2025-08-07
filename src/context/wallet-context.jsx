import { createContext, useContext, useState, useCallback } from 'react';
import { walletApi } from '@/helpers/api/wallet';
import { useAuth } from './auth-context';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    today: { inflow: 0, outflow: 0 },
    week: { inflow: 0, outflow: 0 },
    month: { inflow: 0, outflow: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [balanceData, transactionsData, summaryData] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getTransactions(),
        walletApi.getSummary()
      ]);

      setBalance(balanceData.balance || 0);
      setTransactions(transactionsData.transactions || []);
      setSummary(summaryData.summary || {
        today: { inflow: 0, outflow: 0 },
        week: { inflow: 0, outflow: 0 },
        month: { inflow: 0, outflow: 0 }
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet data');
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError('');

    try {
      const newTransaction = await walletApi.addTransaction({
        ...transactionData,
        userId: user?.id,
        createdAt: new Date().toISOString()
      });

      // Update local state
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update balance
      if (transactionData.type === 'inflow') {
        setBalance(prev => prev + transactionData.amount);
      } else {
        setBalance(prev => prev - transactionData.amount);
      }

      // Refresh summary data
      await fetchWalletData();
      
      return newTransaction;
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchWalletData]);

  const updateTransaction = useCallback(async (id, updates) => {
    setLoading(true);
    setError('');

    try {
      const updatedTransaction = await walletApi.updateTransaction(id, updates);
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      
      // Refresh data to recalculate balance and summary
      await fetchWalletData();
      
      return updatedTransaction;
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWalletData]);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      await walletApi.deleteTransaction(id);
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Refresh data to recalculate balance and summary
      await fetchWalletData();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWalletData]);

  const value = {
    balance,
    transactions,
    summary,
    loading,
    error,
    fetchWalletData,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
