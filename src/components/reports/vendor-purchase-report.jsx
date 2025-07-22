"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, FileText } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { reportsApi } from "../../helpers/api/reports"

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

export function VendorPurchaseReport({ dateFilter, onExportPDF, onExportExcel }) {
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
        const res = await reportsApi.getVendorPurchases(params)
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

  // Memoize chart/table data
  const vendorData = useMemo(() => {
    if (!data?.topVendors) return []
    return data.topVendors.map(v => ({
      vendor: v.name,
      amount: v.totalSpent,
      ngn: v.totalSpent * (data.recentPurchases?.[0]?.ngnPerUsd || 0), // fallback, not always accurate
      items: v.items || 0, // if available
      unpaid: v.unpaid,
    }))
  }, [data])

  // For item breakdown, you may need to fetch from another endpoint or extend backend
  const itemBreakdown = [] // Not available in current API response

  const recentPurchases = useMemo(() => {
    if (!data?.recentPurchases) return []
    return data.recentPurchases.map(txn => ({
      id: txn.id,
      vendor: txn.vendorName,
      item: txn.itemPurchased || "-", // if available
      amount: txn.amountUSD,
      ngn: txn.amountUSD * (txn.exchangeRate || 0),
      date: txn.transactionDate,
      status: txn.status || txn.paymentStatus || "-",
    }))
  }, [data])

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading vendor purchase report...</div>
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

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
        {/* Vendor-wise Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="vendor" type="category" width={80} />
                  <Tooltip formatter={(value) => formatUsdCurrency(value)} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Item-wise Purchases (not available in API, show empty or placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases by Item Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-400">Not available</div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Purchase Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Unpaid (USD)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.map((vendor) => {
                  const totalAmount = vendorData.reduce((sum, v) => sum + v.amount, 0)
                  const percentage = totalAmount ? ((vendor.amount / totalAmount) * 100).toFixed(1) : 0
                  return (
                    <tr key={vendor.vendor} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{vendor.vendor}</td>
                      <td className="py-4 px-4 text-center text-red-600">{formatUsdCurrency(vendor.unpaid)}</td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">
                        {formatUsdCurrency(vendor.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="secondary">{percentage}%</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{purchase.vendor}</td>
                    <td className="py-4 px-4 text-gray-600">{purchase.item}</td>
                    <td className="py-4 px-4 text-gray-600">{purchase.date ? new Date(purchase.date).toLocaleDateString() : "-"}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(purchase.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          purchase.status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
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
