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

export function RecentInvoices() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dashboardApi.getRecentInvoices()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load recent invoices.")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Show a card skeleton for the table
    return (
      <Card className="mb-8">
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Invoices</CardTitle>
        <p className="text-sm text-gray-500">Latest customer invoices</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
                {/* <th className="text-left py-3 px-2 font-medium text-gray-600">Due Date</th> */}
                <th className="text-right py-3 px-2 font-medium text-gray-600">Amount (NGN)</th>
                <th className="text-center py-3 px-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{invoice.customer}</td>
                  <td className="py-3 px-2 text-gray-600">{invoice.issueDate}</td>
                  {/* <td className="py-3 px-2 text-gray-600">{invoice.dueDate}</td> */}
                  <td className="py-3 px-2 text-right font-mono text-gray-900"> ₦{invoice.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge className={statusColors[invoice.status] || "bg-gray-100 text-gray-800"}>
                      {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
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
