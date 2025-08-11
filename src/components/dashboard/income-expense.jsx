import { useEffect, useState } from "react"
import { dashboardApi } from "@/helpers/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatNgnCurrency } from "@/helpers/currency/formatNaira"

// Helper function to format axis values dynamically
const formatYAxisTick = (value) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `₦${(value / 1000).toFixed(0)}K`;
  }
  return `₦${value}`;
};

// Format tooltip values with appropriate units
const formatTooltipValue = (value) => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `₦${(value / 1000).toFixed(1)}K`;
  }
  return `₦${value.toFixed(2)}`;
};

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
              <span className="text-sm text-gray-600">Money In</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-green-600">{formatNgnCurrency(data.today.income)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">{formatNgnCurrency(data.today.expense)}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Difference</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">{formatNgnCurrency(data.today.netProfit)}</span>
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
              <span className="text-sm text-gray-600">Money In</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-green-600">{formatNgnCurrency(data.thisMonth.income)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expense</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">{formatNgnCurrency(data.thisMonth.expense)}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Difference</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">{formatNgnCurrency(data.thisMonth.netProfit)}</span>
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
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10}
                  width={50}
                  tickFormatter={formatYAxisTick}
                  domain={['auto', 'auto']}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatTooltipValue(value), 
                    // name === 'income' ? 'Income' : 'Expense'
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
