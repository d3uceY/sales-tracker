"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Users, DollarSign, AlertCircle } from "lucide-react"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatDate } from "../../helpers/date/formatDate"
import { reportsApi } from "../../helpers/api/reports"
import Spinner from "@/components/ui/spinner"

export function CustomerBalanceReport({ onExportPDF, onExportExcel }) {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState({})

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError("")
    const fetchData = async () => {
      try {
        const params = statusFilter !== "all" ? { status: statusFilter } : {}
        const res = await reportsApi.getCustomerBalances(params)
        if (isMounted) {
          setCustomers(res.data || [])
          setSummary(res.summary || {})
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
  }, [statusFilter])

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [customers, searchTerm])

  // Calculate totals
  const totalOutstanding = filteredCustomers.reduce((sum, customer) => sum + customer.outstandingBalance, 0)
  const totalPurchased = filteredCustomers.reduce((sum, customer) => sum + customer.totalPurchased, 0)
  const totalPaid = filteredCustomers.reduce((sum, customer) => sum + customer.totalPaid, 0)
  const customersWithBalance = filteredCustomers.filter((customer) => customer.outstandingBalance > 0).length

  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Last Transaction",
      "Total Transactions",
      "Total Purchased (USD)",
      "Total Paid (USD)",
      "Outstanding Balance (USD)",
      "Status",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((customer) =>
        [
          `"${customer.customerName}"`,
          customer.lastTransactionDate,
          customer.totalTransactions,
          customer.totalPurchased.toFixed(2),
          customer.totalPaid.toFixed(2),
          customer.outstandingBalance.toFixed(2),
          customer.status,
        ].join(","),
      ),
      // Summary row
      `"TOTAL",,,${totalPurchased.toFixed(2)},${totalPaid.toFixed(2)},${totalOutstanding.toFixed(2)},`,
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `customer-balance-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="py-12 text-center"><Spinner /></div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{customersWithBalance}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatUsdCurrency(totalOutstanding)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchased</p>
                <p className="text-2xl font-bold text-green-600">{formatUsdCurrency(totalPurchased)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Customer Balance Report</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={onExportPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Transaction</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Total Transactions</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total Purchased</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total Paid</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Outstanding Balance</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">{customer.customerName}</td>
                    <td className="py-4 px-4 text-gray-600">{formatDate(customer.lastTransactionDate)}</td>
                    <td className="py-4 px-4 text-center text-gray-900">{customer.totalTransactions}</td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(customer.totalPurchased)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-gray-900">
                      {formatUsdCurrency(customer.totalPaid)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      <span className={customer.outstandingBalance > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                        {formatUsdCurrency(customer.outstandingBalance)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        className={
                          customer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {/* Summary Row */}
                <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                  <td className="py-4 px-4 text-gray-900">TOTAL</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    {filteredCustomers.reduce((sum, c) => sum + c.totalTransactions, 0)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-gray-900">{formatUsdCurrency(totalPurchased)}</td>
                  <td className="py-4 px-4 text-right font-mono text-gray-900">{formatUsdCurrency(totalPaid)}</td>
                  <td className="py-4 px-4 text-right font-mono text-red-600">{formatUsdCurrency(totalOutstanding)}</td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No customers found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
