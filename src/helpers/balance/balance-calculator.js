// Balance calculation utilities

export const calculateCustomerBalance = (transactions, customerId) => {
    const customerTransactions = transactions.filter((t) => t.customerId === customerId)
  
    let runningBalance = 0
    const transactionsWithBalance = customerTransactions.map((transaction) => {
      const transactionTotal = transaction.totalUSD || 0
      const amountPaid = transaction.amountPaid || transactionTotal
  
      runningBalance += transactionTotal - amountPaid
  
      return {
        ...transaction,
        outstandingBalance: runningBalance,
      }
    })
  
    return {
      transactions: transactionsWithBalance,
      currentBalance: runningBalance,
    }
  }
  
  export const getCustomerPreviousBalance = (customerName, existingTransactions = []) => {
    // Filter transactions for this customer
    const customerTransactions = existingTransactions.filter(
      (t) => t.customerName === customerName || t.customer === customerName,
    )
  
    if (customerTransactions.length === 0) {
      return 0
    }
  
    // Calculate running balance
    let balance = 0
    customerTransactions.forEach((transaction) => {
      const totalAmount = transaction.totalUSD || transaction.totalAmountUSD || 0
      const paidAmount = transaction.amountPaid || totalAmount
      balance += totalAmount - paidAmount
    })
  
    return Math.max(0, balance) // Don't return negative balances
  }
  
  export const calculateNewBalance = (previousBalance, newTransactionTotal, amountPaid) => {
    const totalDue = previousBalance + newTransactionTotal
    const remainingBalance = totalDue - amountPaid
    return Math.max(0, remainingBalance)
  }
  
  export const formatBalanceStatus = (balance) => {
    if (balance === 0) {
      return { status: "paid", color: "green", text: "Paid in Full" }
    } else if (balance > 0) {
      return { status: "outstanding", color: "red", text: `Outstanding: $${balance.toFixed(2)}` }
    } else {
      return { status: "overpaid", color: "blue", text: `Credit: $${Math.abs(balance).toFixed(2)}` }
    }
  }
  