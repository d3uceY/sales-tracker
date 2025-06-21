"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react"

const exchangeRateData = [
  { date: "2024-01-01", rate: 1620, buyRate: 1615, sellRate: 1625 },
  { date: "2024-01-05", rate: 1635, buyRate: 1630, sellRate: 1640 },
  { date: "2024-01-10", rate: 1642, buyRate: 1637, sellRate: 1647 },
  { date: "2024-01-15", rate: 1650, buyRate: 1645, sellRate: 1655 },
  { date: "2024-01-20", rate: 1658, buyRate: 1653, sellRate: 1663 },
  { date: "2024-01-25", rate: 1665, buyRate: 1660, sellRate: 1670 },
  { date: "2024-01-30", rate: 1672, buyRate: 1667, sellRate: 1677 },
]

const rateAnalysis = {
  currentRate: 1672,
  previousRate: 1620,
  change: 52,
  changePercent: 3.21,
  highestRate: 1677,
  lowestRate: 1615,
  averageRate: 1649,
  volatility: "Moderate",
}

const profitMarginAnalysis = [
  { rate: 1620, margin: 25.5, profit: 8500000 },
  { rate: 1635, margin: 26.2, profit: 9200000 },
  { rate: 1642, margin: 26.8, profit: 9800000 },
  { rate: 1650, margin: 27.1, profit: 10200000 },
  { rate: 1658, margin: 27.5, profit: 10800000 },
  { rate: 1665, margin: 27.8, profit: 11200000 },
  { rate: 1672, margin: 28.1, profit: 11600000 },
]

export function ExchangeRateReport({ onExportPDF, onExportExcel }) {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Profit Margin vs Exchange Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin vs Exchange Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitMarginAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rate" tickFormatter={(value) => `₦${value}`} />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${value}%`} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "margin" ? `${value}%` : `₦${(value / 1000000).toFixed(1)}M`,
                      name === "margin" ? "Profit Margin" : "Profit Amount",
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="margin"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Profit Margin %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="profit"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Profit Amount"
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
