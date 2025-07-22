import { useEffect, useState } from "react"
import { dashboardApi } from "@/helpers/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Building2, FileText, Receipt } from "lucide-react"

const iconMap = {
  Users,
  Building2,
  FileText,
  Receipt,
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
}

export function SummaryCards() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dashboardApi.getSummaryCards()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load summary cards.")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Show 4 skeleton cards
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (error) {
    return <div className="h-24 flex items-center justify-center text-red-600">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {data.map((item, index) => {
        const Icon = iconMap[item.icon] || Users
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 truncate pr-2">{item.title}</CardTitle>
              <div className={`p-2 rounded-lg ${colorClasses[item.color]} flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-gray-900">{item.value}</div>
              <p className={`text-xs ${item.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {item.change} from last month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
