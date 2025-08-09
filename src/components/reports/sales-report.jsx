"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Download } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { reportsApi } from "../../helpers/api/reports"
import Spinner from "@/components/ui/spinner"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]

export function SalesReport({ dateFilter, customDateFrom, customDateTo, onExportPDF, onExportExcel }) {
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
        const res = await reportsApi.getSalesSummary(params)
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

  const salesData = useMemo(() => data?.salesData || [], [data])
  const recentSales = useMemo(() => data?.recentSales || [], [data])

  if (loading) {
    return <div className="py-12 text-center"><Spinner /></div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
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
                    <td className="py-4 px-4 text-gray-600">{sale.date ? new Date(sale.date).toLocaleDateString() : "-"}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(sale.amount)}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(sale.usdAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          sale.status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : sale.status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
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
