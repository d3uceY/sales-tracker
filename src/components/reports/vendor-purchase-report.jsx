"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, FileText } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"

const vendorData = [
  { vendor: "Best Buy", amount: 8500, ngn: 14025000, items: 15 },
  { vendor: "Amazon", amount: 12000, ngn: 19800000, items: 22 },
  { vendor: "Newegg", amount: 6500, ngn: 10725000, items: 12 },
  { vendor: "B&H Photo", amount: 4200, ngn: 6930000, items: 8 },
]

const itemBreakdown = [
  { item: "Laptop", amount: 15000, ngn: 24750000, count: 25 },
  { item: "Phone", amount: 12000, ngn: 19800000, count: 30 },
  { item: "Dollar", amount: 3500, ngn: 5775000, count: 5 },
  { item: "Other", amount: 700, ngn: 1155000, count: 3 },
]

const recentPurchases = [
  {
    id: 1,
    vendor: "Best Buy",
    item: "Laptop",
    amount: 2500,
    ngn: 4125000,
    date: "2024-01-26",
    status: "paid",
  },
  {
    id: 2,
    vendor: "Amazon",
    item: "Phone",
    amount: 8000,
    ngn: 13200000,
    date: "2024-01-25",
    status: "unpaid",
  },
  {
    id: 3,
    vendor: "Currency Exchange",
    item: "Dollar",
    amount: 10000,
    ngn: 16500000,
    date: "2024-01-24",
    status: "paid",
  },
]

export function VendorPurchaseReport({ dateFilter, onExportPDF, onExportExcel }) {
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

        {/* Item-wise Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases by Item Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatUsdCurrency(value)} />
                  <Bar dataKey="amount" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Items Purchased</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.map((vendor) => {
                  const totalAmount = vendorData.reduce((sum, v) => sum + v.amount, 0)
                  const percentage = ((vendor.amount / totalAmount) * 100).toFixed(1)
                  return (
                    <tr key={vendor.vendor} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{vendor.vendor}</td>
                      <td className="py-4 px-4 text-center text-gray-900">{vendor.items}</td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">
                        {formatUsdCurrency(vendor.amount)}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(vendor.ngn)}</td>
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
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{purchase.vendor}</td>
                    <td className="py-4 px-4 text-gray-600">{purchase.item}</td>
                    <td className="py-4 px-4 text-gray-600">{purchase.date}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(purchase.amount)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(purchase.ngn)}</td>
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
