"use client"

import { useEffect, useState, useMemo } from "react"
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
import { reportsApi } from "../../helpers/api/reports"
import Spinner from "@/components/ui/spinner"

const getDateRangeFromFilter = (dateFilter) => {
  const now = new Date()
  let startDate = null
  let endDate = null
  if (dateFilter === "today") {
    startDate = endDate = now.toISOString().split("T")[0]
  } else if (dateFilter === "this-week") {
    const first = now.getDate() - now.getDay()
    startDate = new Date(now.setDate(first)).toISOString().split("T")[0]
    endDate = new Date().toISOString().split("T")[0]
  } else if (dateFilter === "this-month") {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    endDate = new Date().toISOString().split("T")[0]
  }
  return { startDate, endDate }
}

export function ProfitLossReport({ dateFilter, onExportPDF, onExportExcel }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError("")
    const fetchData = async () => {
      try {
        let params = {}
        if (dateFilter && dateFilter !== "custom") {
          params = getDateRangeFromFilter(dateFilter)
        }
        // TODO: handle custom range if needed
        const res = await reportsApi.getProfitLoss(params)
        if (isMounted) {
          setData(res.data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || "Failed to load report.")
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [dateFilter])

  const monthlyProfitLoss = useMemo(() => data?.monthlyProfitLoss || [], [data])
  const currentMonth = useMemo(() => data?.currentMonth || {}, [data])
  const expenseBreakdown = useMemo(() => data?.expenseBreakdown || [], [data])

  const profitChange = currentMonth.netProfit - (currentMonth.previousMonth?.netProfit || 0)
  const profitChangePercent = currentMonth.previousMonth?.netProfit ? ((profitChange / currentMonth.previousMonth.netProfit) * 100).toFixed(1) : 0

  if (loading) {
    return <div className="py-12 text-center"><Spinner /></div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">

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

      <div className="grid  gap-6">
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
                  const margin = month.income ? ((month.profit / month.income) * 100).toFixed(1) : 0
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
    </div>
  )
}
