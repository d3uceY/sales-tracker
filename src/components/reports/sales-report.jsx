"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Download, FileText } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"

const salesData = [
  { name: "Laptop", value: 15000000, usdValue: 9090.91, count: 25 },
  { name: "Phone", value: 20000000, usdValue: 12121.21, count: 40 },
  { name: "Dollar", value: 8000000, usdValue: 4848.48, count: 15 },
  { name: "Other", value: 2250000, usdValue: 1363.64, count: 8 },
]

const monthlySales = [
  { month: "Jan", ngn: 35000000, usd: 21212.12 },
  { month: "Feb", ngn: 42000000, usd: 25454.55 },
  { month: "Mar", ngn: 38000000, usd: 23030.3 },
  { month: "Apr", ngn: 45250000, usd: 27424.24 },
]

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]

const recentSales = [
  {
    id: 1,
    customer: "Adebayo Electronics",
    item: "Laptop",
    amount: 4500000,
    usdAmount: 2727.27,
    date: "2024-01-26",
    status: "paid",
  },
  {
    id: 2,
    customer: "Lagos Tech Hub",
    item: "Phone",
    amount: 12000000,
    usdAmount: 7272.73,
    date: "2024-01-25",
    status: "unpaid",
  },
  {
    id: 3,
    customer: "Kano Imports Ltd",
    item: "Dollar",
    amount: 8000000,
    usdAmount: 4848.48,
    date: "2024-01-24",
    status: "paid",
  },
]

export function SalesReport({ dateFilter, onExportPDF, onExportExcel }) {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Item Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Item Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNgnCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "ngn" ? formatNgnCurrency(value) : formatUsdCurrency(value),
                      name === "ngn" ? "NGN" : "USD",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="ngn" fill="#10B981" name="NGN" />
                  <Bar dataKey="usd" fill="#3B82F6" name="USD" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Summary by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Item Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Quantity Sold</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item, index) => {
                  const totalRevenue = salesData.reduce((sum, item) => sum + item.value, 0)
                  const percentage = ((item.value / totalRevenue) * 100).toFixed(1)
                  return (
                    <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-4 text-center text-gray-900">{item.count}</td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(item.value)}</td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">
                        {formatUsdCurrency(item.usdValue)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge style={{ backgroundColor: COLORS[index % COLORS.length] }} className="text-white">
                          {percentage}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{sale.customer}</td>
                    <td className="py-4 px-4 text-gray-600">{sale.item}</td>
                    <td className="py-4 px-4 text-gray-600">{sale.date}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(sale.amount)}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(sale.usdAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={sale.status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </Badge>
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
