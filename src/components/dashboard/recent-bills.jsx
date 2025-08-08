import { useEffect, useState } from "react"
import { dashboardApi } from "@/helpers/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const statusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
}

export function RecentBills() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dashboardApi.getRecentBills()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load recent bills.")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Show a card skeleton for the table
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="py-3 px-2"><Skeleton className="h-4 w-20" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-3 px-2"><Skeleton className="h-5 w-24" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return <div className="h-24 flex items-center justify-center text-red-600">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Bills by Vendor</CardTitle>
        <p className="text-sm text-gray-500">Latest vendor bills and payments</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Vendor</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Bill Date</th>
                {/* <th className="text-left py-3 px-2 font-medium text-gray-600">Due Date</th> */}
                <th className="text-right py-3 px-2 font-medium text-gray-600">Amount (USD)</th>
                <th className="text-center py-3 px-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{bill.vendor}</td>
                  <td className="py-3 px-2 text-gray-600">{bill.billDate}</td>
                  {/* <td className="py-3 px-2 text-gray-600">{bill.dueDate}</td> */}
                  <td className="py-3 px-2 text-right font-mono text-gray-900">${bill.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge className={statusColors[bill.status] || "bg-gray-100 text-gray-800"}>
                      {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
