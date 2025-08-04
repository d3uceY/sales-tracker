"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { reportsApi } from "../../helpers/api/reports"
import Spinner from "@/components/ui/spinner"

export function ExchangeRateReport({ onExportPDF, onExportExcel }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError("")
    const fetchData = async () => {
      try {
        const res = await reportsApi.getExchangeRate()
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
  }, [])

  const exchangeRateData = useMemo(() => data?.exchangeRateData || [], [data])
  const rateAnalysis = useMemo(() => data?.rateAnalysis || {}, [data])
  const profitMarginAnalysis = useMemo(() => data?.profitMarginAnalysis || [], [data])

  if (loading) {
    return <div className="py-12 text-center"><Spinner /></div>;
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

      {/* Exchange Rate Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Rate</p>
                <p className="text-2xl font-bold text-blue-600">₦{rateAnalysis.currentRate}</p>
                <p className="text-xs text-gray-500">USD to NGN</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Change</p>
                <p className="text-2xl font-bold text-green-600">+₦{rateAnalysis.change}</p>
                <p className="text-xs text-green-500">+{rateAnalysis.changePercent}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rate</p>
                <p className="text-2xl font-bold text-purple-600">₦{rateAnalysis.averageRate}</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volatility</p>
                <p className="text-2xl font-bold text-orange-600">{rateAnalysis.volatility}</p>
                <p className="text-xs text-gray-500">Risk level</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* Exchange Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exchangeRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      `₦${value}`,
                      name === "rate" ? "Market Rate" : name === "buyRate" ? "Buy Rate" : "Sell Rate",
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={3} name="Market Rate" />
                  <Line
                    type="monotone"
                    dataKey="buyRate"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Buy Rate"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="sellRate"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Sell Rate"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rate History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Market Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Buy Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Sell Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Daily Change</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRateData.map((data, index) => {
                  const previousRate = index > 0 ? exchangeRateData[index - 1].rate : data.rate
                  const dailyChange = data.rate - previousRate
                  const changePercent = previousRate !== 0 ? ((dailyChange / previousRate) * 100).toFixed(2) : 0
                  const profitMargin = profitMarginAnalysis.find((p) => p.rate === data.rate)?.margin || 0

                  return (
                    <tr key={data.date} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {new Date(data.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-gray-900">₦{data.rate}</td>
                      <td className="py-4 px-4 text-center font-mono text-green-600">₦{data.buyRate}</td>
                      <td className="py-4 px-4 text-center font-mono text-red-600">₦{data.sellRate}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-medium ${dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {dailyChange >= 0 ? "+" : ""}₦{dailyChange} ({changePercent}%)
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-blue-600">{profitMargin}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
