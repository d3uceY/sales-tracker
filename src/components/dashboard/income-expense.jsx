import { useEffect, useState } from "react"
import { dashboardApi } from "@/helpers/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

export function IncomeExpense() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dashboardApi.getIncomeExpense()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load income/expense data.")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Show 2 summary skeleton cards and 1 chart skeleton
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Today Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
        {/* This Month Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </CardContent>
        </Card>
        {/* Chart Skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (error) {
    return <div className="h-24 flex items-center justify-center text-red-600">{error}</div>
  }
  if (!data) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-green-600">${data.today.income.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expense</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">${data.today.expense.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Profit</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">${data.today.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Month's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-green-600">${data.thisMonth.income.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expense</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">${data.thisMonth.expense.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Profit</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">${data.thisMonth.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg font-semibold text-gray-900">Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === "income" ? "Income" : "Expense"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
