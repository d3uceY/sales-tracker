const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Mock data for development - replace with actual API calls
const mockTransactions = [
  {
    id: 1,
    type: 'inflow',
    amount: 50000,
    reason: 'Initial Cash Setup',
    description: 'Setting up initial petty cash',
    date: '2024-01-08',
    performedBy: 'John Doe',
    createdAt: '2024-01-08T10:00:00Z'
  },
  {
    id: 2,
    type: 'outflow',
    amount: 5000,
    reason: 'Office Supplies',
    description: 'Purchased stationery',
    date: '2024-01-08',
    performedBy: 'Jane Smith',
    createdAt: '2024-01-08T14:30:00Z'
  },
  {
    id: 3,
    type: 'inflow',
    amount: 25000,
    reason: 'Cash Sales',
    description: 'Daily cash sales deposit',
    date: '2024-01-07',
    performedBy: 'Mike Johnson',
    createdAt: '2024-01-07T16:00:00Z'
  }
];

let mockBalance = 70000;

export const walletApi = {
  async getBalance() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      balance: mockBalance
    };
  },

  async getTransactions(filters = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredTransactions = [...mockTransactions];
    
    // Apply filters if provided
    if (filters.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
    }
    
    if (filters.dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo);
    }
    
    return {
      success: true,
      transactions: filteredTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  },

  async getSummary() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const calculateSummary = (fromDate) => {
      const filtered = mockTransactions.filter(t => t.date >= fromDate);
      return {
        inflow: filtered.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0),
        outflow: filtered.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0)
      };
    };
    
    return {
      success: true,
      summary: {
        today: calculateSummary(today),
        week: calculateSummary(weekAgo),
        month: calculateSummary(monthAgo)
      }
    };
  },

  async addTransaction(transactionData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTransaction = {
      id: Date.now(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    
    mockTransactions.unshift(newTransaction);
    
    // Update mock balance
    if (transactionData.type === 'inflow') {
      mockBalance += transactionData.amount;
    } else {
      mockBalance -= transactionData.amount;
    }
    
    return newTransaction;
  },

  async updateTransaction(id, updates) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const oldTransaction = mockTransactions[index];
    const updatedTransaction = { ...oldTransaction, ...updates };
    
    mockTransactions[index] = updatedTransaction;
    
    // Recalculate balance (simplified - in real app, you'd recalculate from all transactions)
    const balanceDiff = (updatedTransaction.type === 'inflow' ? updatedTransaction.amount : -updatedTransaction.amount) -
                       (oldTransaction.type === 'inflow' ? oldTransaction.amount : -oldTransaction.amount);
    mockBalance += balanceDiff;
    
    return updatedTransaction;
  },

  async deleteTransaction(id) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const transaction = mockTransactions[index];
    mockTransactions.splice(index, 1);
    
    // Update mock balance
    if (transaction.type === 'inflow') {
      mockBalance -= transaction.amount;
    } else {
      mockBalance += transaction.amount;
    }
    
    return { success: true };
  }
};
