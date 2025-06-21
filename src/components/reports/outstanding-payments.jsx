import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatUsdCurrency } from "../../helpers/currency/formatDollars"
import { formatNgnCurrency } from "../../helpers/currency/formatNaira"
import { formatDate } from "../../helpers/date/formatDate"

const unpaidVendorBills = [
  {
    id: 1,
    vendor: "Amazon",
    item: "Phone",
    amount: 8000,
    ngn: 13200000,
    dueDate: "2024-02-15",
    daysOverdue: 5,
    status: "overdue",
  },
  {
    id: 2,
    vendor: "B&H Photo",
    item: "Other",
    amount: 1200,
    ngn: 1986000,
    dueDate: "2024-02-20",
    daysOverdue: 0,
    status: "due",
  },
  {
    id: 3,
    vendor: "Newegg",
    item: "Laptop",
    amount: 3500,
    ngn: 5775000,
    dueDate: "2024-02-25",
    daysOverdue: 0,
    status: "upcoming",
  },
]

const unpaidCustomerPayments = [
  {
    id: 1,
    customer: "Lagos Tech Hub",
    item: "Phone",
    amount: 12000000,
    usd: 7272.73,
    dueDate: "2024-02-10",
    daysOverdue: 10,
    status: "overdue",
  },
  {
    id: 2,
    customer: "Port Harcourt Tech",
    item: "Other",
    amount: 2500000,
    usd: 1515.15,
    dueDate: "2024-02-18",
    daysOverdue: 2,
    status: "overdue",
  },
  {
    id: 3,
    customer: "Kano Electronics",
    item: "Laptop",
    amount: 6000000,
    usd: 3636.36,
    dueDate: "2024-02-22",
    daysOverdue: 0,
    status: "due",
  },
]

export function OutstandingPayments() {
  const getStatusBadge = (status, daysOverdue) => {
    if (status === "overdue") {
      return <Badge className="bg-red-100 text-red-800">Overdue ({daysOverdue} days)</Badge>
    } else if (status === "due") {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Now</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Unpaid Vendor Bills</p>
              <p className="text-2xl font-bold text-red-600">{unpaidVendorBills.length}</p>
              <p className="text-xs text-gray-500">
                {formatUsdCurrency(unpaidVendorBills.reduce((sum, bill) => sum + bill.amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Unpaid Customer Sales</p>
              <p className="text-2xl font-bold text-orange-600">{unpaidCustomerPayments.length}</p>
              <p className="text-xs text-gray-500">
                {formatNgnCurrency(unpaidCustomerPayments.reduce((sum, payment) => sum + payment.amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Overdue Bills</p>
              <p className="text-2xl font-bold text-red-600">
                {unpaidVendorBills.filter((bill) => bill.status === "overdue").length}
              </p>
              <p className="text-xs text-red-500">Immediate attention required</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {unpaidCustomerPayments.filter((payment) => payment.status === "overdue").length}
              </p>
              <p className="text-xs text-red-500">Follow up required</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Payments Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vendor-bills" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vendor-bills">Unpaid Vendor Bills</TabsTrigger>
              <TabsTrigger value="customer-payments">Unpaid Customer Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="vendor-bills">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidVendorBills.map((bill) => (
                      <tr
                        key={bill.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          bill.status === "overdue" ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">{bill.vendor}</td>
                        <td className="py-4 px-4 text-gray-600">{bill.item}</td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">
                          {formatUsdCurrency(bill.amount)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">{formatNgnCurrency(bill.ngn)}</td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(bill.status, bill.daysOverdue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="customer-payments">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (NGN)</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Amount (USD)</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidCustomerPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          payment.status === "overdue" ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">{payment.customer}</td>
                        <td className="py-4 px-4 text-gray-600">{payment.item}</td>
                        <td className="py-4 px-4 text-gray-600">{formatDate(payment.dueDate)}</td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">
                          {formatNgnCurrency(payment.amount)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-gray-900">
                          {formatUsdCurrency(payment.usd)}
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(payment.status, payment.daysOverdue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
