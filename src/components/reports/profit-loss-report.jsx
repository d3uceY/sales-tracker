"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { reportsApi } from "../../helpers/api/reports"
import Spinner from "@/components/ui/spinner"

export function ProfitLossReport({ dateFilter, customDateFrom, customDateTo, onExportPDF, onExportExcel }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError("")
    const fetchData = async () => {
      try {
        const params = {
          dateFilter,
          ...(dateFilter === "custom" && customDateFrom && customDateTo && {
            customDateFrom,
            customDateTo,
          }),
        }
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
  }, [dateFilter, customDateFrom, customDateTo])

  const monthlyProfitLoss = useMemo(() => data?.monthlyProfitLoss || [], [data])

  if (loading) {
    return <div className="py-12 text-center"><Spinner /></div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
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
