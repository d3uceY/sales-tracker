"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"

const monthlyProfitLoss = [
  {
    month: "Jan",
    income: 35000000,
    expenses: 25000000,
    profit: 10000000,
    incomeUSD: 21212,
    expensesUSD: 15152,
    profitUSD: 6060,
  },
  {
    month: "Feb",
    income: 42000000,
    expenses: 28000000,
    profit: 14000000,
    incomeUSD: 25455,
    expensesUSD: 16970,
    profitUSD: 8485,
  },
  {
    month: "Mar",
    income: 38000000,
    expenses: 26000000,
    profit: 12000000,
    incomeUSD: 23030,
    expensesUSD: 15758,
    profitUSD: 7273,
  },
  {
    month: "Apr",
    income: 45250000,
    expenses: 32180000,
    profit: 13070000,
    incomeUSD: 27424,
    expensesUSD: 19503,
    profitUSD: 7921,
  },
]

const currentMonth = {
  totalIncome: 45250000,
  totalExpenses: 32180000,
  netProfit: 13070000,
  totalIncomeUSD: 27424,
  totalExpensesUSD: 19503,
  netProfitUSD: 7921,
  profitMargin: 28.9,
  previousMonth: {
    netProfit: 12000000,
    netProfitUSD: 7273,
  },
}

const expenseBreakdown = [
  { category: "Vendor Purchases", amount: 28000000, usd: 16970, percentage: 87 },
  { category: "Shipping & Logistics", amount: 2500000, usd: 1515, percentage: 8 },
  { category: "Other Expenses", amount: 1680000, usd: 1018, percentage: 5 },
]

export function ProfitLossReport({ dateFilter, onExportPDF, onExportExcel }) {
  const profitChange = currentMonth.netProfit - currentMonth.previousMonth.netProfit
  const profitChangePercent = ((profitChange / currentMonth.previousMonth.netProfit) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={onExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatNgnCurrency(currentMonth.totalIncome)}</p>
                <p className="text-xs text-gray-500">{formatUsdCurrency(currentMonth.totalIncomeUSD)}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatNgnCurrency(currentMonth.totalExpenses)}</p>
                <p className="text-xs text-gray-500">{formatUsdCurrency(currentMonth.totalExpensesUSD)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">{formatNgnCurrency(currentMonth.netProfit)}</p>
                <p className="text-xs text-gray-500">{formatUsdCurrency(currentMonth.netProfitUSD)}</p>
                <p className={`text-xs ${profitChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {profitChange >= 0 ? "+" : ""}
                  {profitChangePercent}% vs last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProfitLoss}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNgnCurrency(value),
                      name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Profit",
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseBreakdown} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip formatter={(value) => formatNgnCurrency(value)} />
                  <Bar dataKey="amount" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Income (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Income (USD)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Expenses (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Expenses (USD)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Profit (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Profit (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {monthlyProfitLoss.map((month) => {
                  const margin = ((month.profit / month.income) * 100).toFixed(1)
                  return (
                    <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{month.month}</td>
                      <td className="py-4 px-4 text-right font-mono text-green-600">
                        {formatNgnCurrency(month.income)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-green-600">
                        {formatUsdCurrency(month.incomeUSD)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-red-600">
                        {formatNgnCurrency(month.expenses)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-red-600">
                        {formatUsdCurrency(month.expensesUSD)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-blue-600">
                        {formatNgnCurrency(month.profit)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-blue-600">
                        {formatUsdCurrency(month.profitUSD)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`font-medium ${Number.parseFloat(margin) >= 25 ? "text-green-600" : Number.parseFloat(margin) >= 15 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((expense) => (
                  <tr key={expense.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{expense.category}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatNgnCurrency(expense.amount)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">{formatUsdCurrency(expense.usd)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-gray-700">{expense.percentage}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
