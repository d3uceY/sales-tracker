import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Users2,
  FileText,
  Settings,
  LogOut,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Role", href: "/roles", icon: UserCheck },
  { name: "User", href: "/users", icon: Users },
  { name: "Vendor", href: "/vendors", icon: Building2 },
  { name: "Customer", href: "/customers", icon: Users2 },
  { name: "Report", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">SalesFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
