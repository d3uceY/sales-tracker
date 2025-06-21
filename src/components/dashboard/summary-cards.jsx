import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, FileText, Receipt } from "lucide-react"

const summaryData = [
  {
    title: "Total Customers",
    value: "1,234",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "blue",
  },
  {
    title: "Total Vendors",
    value: "89",
    change: "+5%",
    changeType: "positive",
    icon: Building2,
    color: "green",
  },
  {
    title: "Total Invoices",
    value: "2,456",
    change: "+18%",
    changeType: "positive",
    icon: FileText,
    color: "purple",
  },
  {
    title: "Total Bills",
    value: "1,789",
    change: "-3%",
    changeType: "negative",
    icon: Receipt,
    color: "orange",
  },
]

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
}

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {summaryData.map((item, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 truncate pr-2">{item.title}</CardTitle>
            <div className={`p-2 rounded-lg ${colorClasses[item.color]} flex-shrink-0`}>
              <item.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">{item.value}</div>
            <p className={`text-xs ${item.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {item.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
