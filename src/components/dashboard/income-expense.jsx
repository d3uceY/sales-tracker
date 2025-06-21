import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

const monthlyData = [
  { month: "Jan", income: 85000, expense: 45000 },
  { month: "Feb", income: 92000, expense: 52000 },
  { month: "Mar", income: 78000, expense: 48000 },
  { month: "Apr", income: 101000, expense: 61000 },
  { month: "May", income: 95000, expense: 55000 },
  { month: "Jun", income: 107000, expense: 67000 },
  { month: "Jul", income: 112000, expense: 72000 },
  { month: "Aug", income: 109000, expense: 69000 },
  { month: "Sep", income: 115000, expense: 75000 },
  { month: "Oct", income: 118000, expense: 78000 },
  { month: "Nov", income: 122000, expense: 82000 },
  { month: "Dec", income: 125000, expense: 85000 },
]

export function IncomeExpense() {
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
            <span className="text-base lg:text-lg font-bold text-green-600">$12,450</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expense</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">$8,230</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Profit</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">$4,220</span>
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
            <span className="text-base lg:text-lg font-bold text-green-600">$125,000</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-600">Expense</span>
            </div>
            <span className="text-base lg:text-lg font-bold text-red-600">$85,000</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Profit</span>
              <span className="text-base lg:text-lg font-bold text-blue-600">$40,000</span>
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
              <LineChart data={monthlyData.slice(-6)}>
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
