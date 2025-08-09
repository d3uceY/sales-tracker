import { useEffect, useState } from "react"
import { dashboardApi } from "@/helpers/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatNgnCurrency } from '@/helpers/currency/formatNaira'

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

export function CashflowChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dashboardApi.getCashflowTrend()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load cashflow data.")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Show a card skeleton for the chart
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return <div className="h-80 flex items-center justify-center text-red-600">{error}</div>
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Cashflow Overview</CardTitle>
        <p className="text-sm text-gray-500">Monthly cashflow trend for {new Date().getFullYear()}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis 
                stroke="#6b7280" 
                fontSize={11}
                width={60}
                tickFormatter={formatYAxisTick}
                domain={['auto', 'auto']}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                formatter={(value) => [formatTooltipValue(value), "Cashflow"]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
