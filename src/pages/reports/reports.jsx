"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SalesReport } from "../../components/reports/sales-report"
import { ProfitLossReport } from "../../components/reports/profit-loss-report"
import { FileText, TrendingUp, DollarSign, Users } from "lucide-react"
import { CustomerBalanceReport } from "../../components/reports/customer-balance-report"
import { reportsApi } from "../../helpers/api/reports"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import Spinner from "@/components/ui/spinner"

export default function Reports() {
  const [dateFilter, setDateFilter] = useState("this-month")
  const [customDateFrom, setCustomDateFrom] = useState("")
  const [customDateTo, setCustomDateTo] = useState("")
  const [summaryCards, setSummaryCards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSummaryCards = async () => {
      try {
        setLoading(true)
        setError("")
        const params = {
          dateFilter,
          ...(dateFilter === "custom" && customDateFrom && customDateTo && {
            customDateFrom,
            customDateTo,
          }),
        }
        const data = await reportsApi.getSummaryCards(params)
        setSummaryCards(data)
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load summary data.")
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryCards()
  }, [dateFilter, customDateFrom, customDateTo])

  const handleExportPDF = (reportType) => {
    // Mock export functionality
    alert(`Exporting ${reportType} as PDF...`)
  }

  const handleExportExcel = (reportType) => {
    // Mock export functionality
    alert(`Exporting ${reportType} as Excel...`)
  }

  const formatChange = (change) => {
    if (!change && change !== 0) return null
    const isPositive = change >= 0
    const sign = isPositive ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Comprehensive business insights and financial reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-full sm:w-40"
              />
              <span className="text-gray-500 hidden sm:inline">to</span>
              <Input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-center h-20">
                  <Spinner />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2 truncate">
                    Total Revenue
                    <span className="inline-flex p-1 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </span>
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-green-600">
                    {formatNgnCurrency(summaryCards?.totalRevenue?.value || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatUsdCurrency(summaryCards?.totalRevenue?.value || 0)}
                  </p>
                  {summaryCards?.totalRevenue?.change !== null && (
                    <p className={`text-xs ${summaryCards?.totalRevenue?.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatChange(summaryCards?.totalRevenue?.change)} vs last month
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2 truncate">
                    Total Expenses
                    <span className="inline-flex p-1 bg-red-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </span>
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-red-600">
                    {formatNgnCurrency(summaryCards?.totalExpenses?.value || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatUsdCurrency(summaryCards?.totalExpenses?.value || 0)}
                  </p>
                  {summaryCards?.totalExpenses?.change !== null && (
                    <p className={`text-xs ${summaryCards?.totalExpenses?.change >= 0 ? "text-red-500" : "text-green-500"}`}>
                      {formatChange(summaryCards?.totalExpenses?.change)} vs last month
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2 truncate">
                    Net Profit
                    <span className="inline-flex p-1 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </span>
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-blue-600">
                    {formatNgnCurrency(summaryCards?.netProfit?.value || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatUsdCurrency(summaryCards?.netProfit?.value || 0)}
                  </p>
                  {summaryCards?.netProfit?.change !== null && (
                    <p className={`text-xs ${summaryCards?.netProfit?.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatChange(summaryCards?.netProfit?.change)} vs last month
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Active Customers
                    <span className="inline-flex p-1 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </span>
                </p>
                <p className="text-2xl font-bold text-indigo-600">{summaryCards?.activeCustomers?.value || 0}</p>
                {summaryCards?.activeCustomers?.change !== null && (
                  <p className={`text-xs ${summaryCards?.activeCustomers?.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatChange(summaryCards?.activeCustomers?.change)} vs last month
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900">Detailed Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="space-y-4 lg:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 min-w-max">
                <TabsTrigger value="sales" className="text-xs lg:text-sm">
                  Sales Report
                </TabsTrigger>
                <TabsTrigger value="profit-loss" className="text-xs lg:text-sm">
                  Profit & Loss
                </TabsTrigger>
                <TabsTrigger value="customer-balance" className="text-xs lg:text-sm">
                  Customer Balance
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sales">
              <SalesReport
                dateFilter={dateFilter}
                customDateFrom={customDateFrom}
                customDateTo={customDateTo}
                onExportPDF={() => handleExportPDF("Sales Report")}
                onExportExcel={() => handleExportExcel("Sales Report")}
              />
            </TabsContent>

            <TabsContent value="profit-loss">
              <ProfitLossReport
                dateFilter={dateFilter}
                customDateFrom={customDateFrom}
                customDateTo={customDateTo}
                onExportPDF={() => handleExportPDF("Profit & Loss Report")}
                onExportExcel={() => handleExportExcel("Profit & Loss Report")}
              />
            </TabsContent>

            <TabsContent value="customer-balance">
              <CustomerBalanceReport
                onExportPDF={() => handleExportPDF("Customer Balance Report")}
                onExportExcel={() => handleExportExcel("Customer Balance Report")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
