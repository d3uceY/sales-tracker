import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentInvoices = [
  {
    id: "INV-001",
    customer: "Adebayo Electronics",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 2500000,
    status: "paid",
  },
  {
    id: "INV-002",
    customer: "Lagos Tech Hub",
    issueDate: "2024-01-14",
    dueDate: "2024-02-14",
    amount: 1800000,
    status: "pending",
  },
  {
    id: "INV-003",
    customer: "Kano Imports Ltd",
    issueDate: "2024-01-13",
    dueDate: "2024-02-13",
    amount: 3200000,
    status: "overdue",
  },
  {
    id: "INV-004",
    customer: "Abuja Gadgets",
    issueDate: "2024-01-12",
    dueDate: "2024-02-12",
    amount: 950000,
    status: "paid",
  },
  {
    id: "INV-005",
    customer: "Port Harcourt Tech",
    issueDate: "2024-01-11",
    dueDate: "2024-02-11",
    amount: 1650000,
    status: "pending",
  },
]

const statusColors = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
}

export function RecentInvoices() {
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
                <th className="text-left py-3 px-2 font-medium text-gray-600">Issue Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Due Date</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">Amount (NGN)</th>
                <th className="text-center py-3 px-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{invoice.customer}</td>
                  <td className="py-3 px-2 text-gray-600">{invoice.issueDate}</td>
                  <td className="py-3 px-2 text-gray-600">{invoice.dueDate}</td>
                  <td className="py-3 px-2 text-right font-mono text-gray-900">₦{invoice.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
