"use client"

import { useState, useMemo } from "react"
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
import { useCustomerData } from "../../context/CustomerContext"

export default function CustomerTransactions() {
  const {
    customers,
    loading,
    pagination,
    filters,
    setPage,
    setSearch,
    setStatus,
    setItem,
    addCustomerTransaction,
    editCustomer,
    removeCustomer,
    fetchCustomers,
  } = useCustomerData();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // Filtering and pagination are now handled by the backend/context
  const paginatedTransactions = customers;
  const totalPages = Math.ceil((pagination.total || customers.length) / pagination.pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize;

  // Stats
  const totalRevenueNGN = useMemo(() => customers.reduce((sum, t) => sum + (t.totalNGN || 0), 0), [customers]);
  const totalRevenueUSD = useMemo(() => customers.reduce((sum, t) => sum + (t.totalUSD || 0), 0), [customers]);
  const unpaidTransactions = useMemo(() => customers.filter((t) => t.paymentStatus === "unpaid").length, [customers]);

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

  const handleSaveTransaction = async (transactionData) => {
    if (selectedTransaction) {
      await editCustomer(selectedTransaction.id, transactionData)
    } else {
      await addCustomerTransaction(transactionData.customerId, transactionData)
    }
    setIsTransactionModalOpen(false)
    fetchCustomers()
  }

  const handleConfirmDelete = async () => {
    await removeCustomer(selectedTransaction.id)
    setIsDeleteModalOpen(false)
    setSelectedTransaction(null)
    fetchCustomers()
  }

  const handleGenerateInvoice = (transaction) => {
    const businessInfo = {
      name: "Your Business Name",
      address: "123 Business Street, Lagos, Nigeria",
      phone: "+234 123 456 7890",
      email: "info@yourbusiness.com",
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (NGN)</p>
                <p className="text-2xl font-bold text-green-600">{formatNgnCurrency(totalRevenueNGN)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (USD)</p>
                <p className="text-2xl font-bold text-purple-600">{formatUsdCurrency(totalRevenueUSD)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">{unpaidTransactions}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
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
                value={filters.status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <select
                value={filters.item}
                onChange={(e) => setItem(e.target.value)}
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
                  value={filters.search}
                  onChange={(e) => setSearch(e.target.value)}
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
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total (NGN)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">{startIndex + index + 1}</td>
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
                      {formatNgnCurrency(transaction.amountNGN)}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">₦{transaction.exchangeRate}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(transaction.amountUSD)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-600">
                      {formatUsdCurrency(transaction.otherExpensesUSD)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-600">
                      {formatNgnCurrency(transaction.otherExpensesNGN)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          transaction.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + pagination.pageSize, pagination.total)} of{" "}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
  )
}
