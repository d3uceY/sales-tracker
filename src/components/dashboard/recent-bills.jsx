import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentBills = [
  {
    id: "BILL-001",
    vendor: "Amazon US",
    billDate: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 1500,
    status: "paid",
  },
  {
    id: "BILL-002",
    vendor: "Best Buy",
    billDate: "2024-01-14",
    dueDate: "2024-02-14",
    amount: 2200,
    status: "pending",
  },
  {
    id: "BILL-003",
    vendor: "Newegg",
    billDate: "2024-01-13",
    dueDate: "2024-02-13",
    amount: 890,
    status: "overdue",
  },
  {
    id: "BILL-004",
    vendor: "B&H Photo",
    billDate: "2024-01-12",
    dueDate: "2024-02-12",
    amount: 3400,
    status: "paid",
  },
  {
    id: "BILL-005",
    vendor: "Walmart",
    billDate: "2024-01-11",
    dueDate: "2024-02-11",
    amount: 750,
    status: "pending",
  },
]

const statusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
}

export function RecentBills() {
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
                <th className="text-left py-3 px-2 font-medium text-gray-600">Due Date</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">Amount (USD)</th>
                <th className="text-center py-3 px-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{bill.vendor}</td>
                  <td className="py-3 px-2 text-gray-600">{bill.billDate}</td>
                  <td className="py-3 px-2 text-gray-600">{bill.dueDate}</td>
                  <td className="py-3 px-2 text-right font-mono text-gray-900">${bill.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge className={statusColors[bill.status]}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
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
