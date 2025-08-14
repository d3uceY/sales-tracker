"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"

export function TransactionHistoryTable({ transactions, type = "customer" }) {
  const formatCurrency = (amount, currency = "USD") => {
    if (currency === "NGN") {
      return `₦${amount?.toLocaleString() || "0"}`
    }
    return `$${amount?.toLocaleString() || "0"}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { className: "bg-green-100 text-green-800", label: "Paid" },
      partial: { className: "bg-yellow-100 text-yellow-800", label: "Partial" },
      pending: { className: "bg-red-100 text-red-800", label: "Pending" },
      overdue: { className: "bg-red-100 text-red-800", label: "Overdue" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transaction history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Transaction History</h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Reference</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b">Item</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 border-b">Qty</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Price (USD)</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Price (NGN)</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 border-b">Rate</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Other Exp.</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Total (USD)</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Total (NGN)</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Paid</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 border-b">Balance</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 border-b">Status</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 border-b text-gray-900">{formatDate(transaction.transactionDate)}</td>
                <td className="py-3 px-4 border-b text-gray-600 font-mono text-xs">{transaction.referenceNumber}</td>
                <td className="py-3 px-4 border-b text-gray-900">{transaction.itemPurchased}</td>
                <td className="py-3 px-4 border-b text-center text-gray-600">{transaction.quantity}</td>
                <td className="py-3 px-4 border-b text-right text-gray-900">{formatCurrency(transaction.priceUSD)}</td>
                <td className="py-3 px-4 border-b text-right text-gray-900">
                  {formatCurrency(transaction.priceNGN, "NGN")}
                </td>
                <td className="py-3 px-4 border-b text-center text-gray-600">{transaction.exchangeRate}</td>
                <td className="py-3 px-4 border-b text-right text-gray-600">
                  <div className="space-y-1">
                    <div>{formatCurrency(transaction.otherExpensesUSD)}</div>
                    <div className="text-xs">{formatCurrency(transaction.otherExpensesNGN, "NGN")}</div>
                  </div>
                </td>
                <td className="py-3 px-4 border-b text-right font-medium text-gray-900">
                  {formatCurrency(transaction.totalUSD)}
                </td>
                <td className="py-3 px-4 border-b text-right font-medium text-gray-900">
                  {formatCurrency(transaction.totalNGN, "NGN")}
                </td>
                <td className="py-3 px-4 border-b text-right text-gray-900">
                  {formatCurrency(transaction.amountPaid, "NGN")}
                </td>
                <td className="py-3 px-4 border-b text-right text-gray-900">
                  {formatCurrency(transaction.outstandingBalance, "NGN")}
                </td>
                <td className="py-3 px-4 border-b text-center">{getPaymentStatusBadge(transaction.paymentStatus)}</td>
                <td className="py-3 px-4 border-b">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit Transaction"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
