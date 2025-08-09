"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CustomerTransactionModal } from "../../components/transactions/customer-transaction-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Plus, Search, Edit, Trash2, Users, TrendingUp, DollarSign, FileText } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { formatDate } from "../../helpers/date/formatDate"
import { downloadInvoicePDF } from "../../helpers/invoice/invoice-generator"
import axios from "axios"
import { authAxios } from "../../helpers/api/auth"
import React from "react"
import Spinner from "@/components/ui/spinner"
import { toast } from "react-hot-toast"
import { updateTransaction, deleteTransaction } from "@/helpers/api/transaction"
import { useBusiness } from "@/context/BusinessContext"

export default function CustomerTransactions() {
  // All hooks must be called unconditionally and at the top
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const { businessInfo } = useBusiness();

  // Stats (always call useMemo, never conditionally)
  const totalRevenueNGN = useMemo(() => transactions.reduce((sum, t) => sum + (t?.totalNGN || 0), 0), [transactions]);
  const totalRevenueUSD = useMemo(() => transactions.reduce((sum, t) => sum + (t?.totalUSD || 0), 0), [transactions]);
  const unpaidTransactions = useMemo(() => transactions.filter((t) => t?.paymentStatus === "unpaid").length, [transactions]);

  // Filter transactions like vendors
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.itemPurchased?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.paymentStatus === statusFilter;
    const matchesItem = itemFilter === "all" || transaction.itemPurchased === itemFilter;
    return matchesSearch && matchesStatus && matchesItem;
  });

  // Move fetchTransactions out of useEffect so it can be reused
  async function fetchTransactions() {
    setLoading(true)
    setError(null)
    try {
      const res = await authAxios.get('/transactions/all-with-customer')
      setTransactions(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Add transaction handler
  async function addTransaction({ customerId, transactionData }) {
    await authAxios.post(`/customers/${customerId}/transactions`, transactionData);
    await fetchTransactions();
    setIsTransactionModalOpen(false);
  }

  function formatStatus(status) {
    if (!status || typeof status !== "string") return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Error boundary for this component
  try {
    if (error) {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">An error occurred while loading customer transactions.</h2>
          <p>{error.message || String(error)}</p>
        </div>
      );
    }

    const handleAddTransaction = () => {
      setSelectedTransaction(null)
      setIsTransactionModalOpen(true)
    }

    const handleEditTransaction = (transaction) => {
      setSelectedTransaction(transaction)
      setIsTransactionModalOpen(true)
    }

    const handleDeleteTransaction = (transaction) => {
      setSelectedTransaction(transaction)
      setIsDeleteModalOpen(true)
    }

    const handleSaveTransaction = async ({ customerId, transactionData }) => {
      if (selectedTransaction) {
        try {
          await updateTransaction(selectedTransaction.id, transactionData)
          toast.success("Transaction updated successfully!")
          await fetchTransactions()
        } catch (err) {
          toast.error("Failed to update transaction.")
        }
      } else {
        await addTransaction({ customerId, transactionData })
      }
      setIsTransactionModalOpen(false)
    }

    const handleConfirmDelete = async () => {
      try {
        await deleteTransaction(selectedTransaction.id)
        toast.success("Transaction deleted successfully!")
        await fetchTransactions()
      } catch (err) {
        toast.error("Failed to delete transaction.")
      }
      setIsDeleteModalOpen(false)
      setSelectedTransaction(null)
    }

    const handleGenerateInvoice = (transaction) => {
      if (!businessInfo) {
        console.error("Business information not available");
        return;
      }
      downloadInvoicePDF(transaction, businessInfo)
    }

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Transactions</h1>
            <p className="text-gray-600 mt-2">Track sales to Nigerian customers</p>
          </div>
          <Button onClick={handleAddTransaction} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer Sale
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  Total Sales
                  <span className="inline-flex p-1 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </span>
                </p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  Revenue (NGN)
                  <span className="inline-flex p-1 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </span>
                </p>
                <p className="text-2xl font-bold text-green-600">{formatNgnCurrency(totalRevenueNGN)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  Revenue (USD)
                  <span className="inline-flex p-1 bg-purple-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </span>
                </p>
                <p className="text-2xl font-bold text-purple-600">{formatUsdCurrency(totalRevenueUSD)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900">All Customer Sales</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <select
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Items</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Phone">Phone</option>
                  <option value="Dollar">Dollar</option>
                  <option value="Other">Other</option>
                </select>
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search customers or items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">S/N</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Rate</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Other Exp (USD)</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Other Exp (NGN)</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount Paid</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Outstanding Balance</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total (NGN)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="13" className="py-8">
                        <Spinner />
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="py-8 text-center text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">{index + 1}</td>
                        <td className="py-4 px-4 font-medium text-gray-900">{transaction.customerName}</td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="secondary"
                            className={
                              transaction.itemPurchased === "Laptop"
                                ? "bg-blue-50 text-blue-700"
                                : transaction.itemPurchased === "Phone"
                                  ? "bg-green-50 text-green-700"
                                  : transaction.itemPurchased === "Dollar"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-gray-50 text-gray-700"
                            }
                          >
                            {transaction.itemPurchased}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(transaction.transactionDate)}</td>
                        <td className="py-4 px-4 text-center text-gray-900">
                          {transaction.itemPurchased === "Dollar"
                            ? formatUsdCurrency(transaction.quantity)
                            : transaction.quantity}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">
                          {formatNgnCurrency(transaction.priceNGN || transaction.amountNGN)}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">₦{transaction.exchangeRate}</td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">
                          {formatUsdCurrency(transaction.priceUSD || transaction.amountUSD)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-gray-600">
                          {formatUsdCurrency(transaction.otherExpensesUSD)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-gray-600">
                          {formatNgnCurrency(transaction.otherExpensesNGN)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-blue-900">
                          {formatNgnCurrency(transaction.amountPaid)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-red-900">
                          {formatNgnCurrency(transaction.outstandingBalance)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            className={
                              transaction.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : transaction.paymentStatus === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {formatStatus(transaction.paymentStatus)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-gray-900">
                          <div className="group relative">
                            {formatNgnCurrency(transaction.totalNGN)}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              USD: {formatUsdCurrency(transaction.totalUSD)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGenerateInvoice(transaction)}
                              className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                              title="Generate Invoice"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* No pagination for now as data is fetched all at once */}
          </CardContent>
        </Card>

        {/* Modals */}
        <CustomerTransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSave={handleSaveTransaction}
          transaction={selectedTransaction}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Transaction"
          message={`Are you sure you want to delete this transaction with "${selectedTransaction?.customerName}"? This action cannot be undone.`}
        />
      </div>
    );
  } catch (err) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">A rendering error occurred in Customer Transactions.</h2>
        <p>{err.message || String(err)}</p>
      </div>
    );
  }
}
