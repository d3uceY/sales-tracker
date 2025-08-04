import { Link, useLocation, useNavigate } from "react-router-dom"
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
  ChevronLeft,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../context/auth-context"
import { useBusiness } from "../../context/BusinessContext"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Role Management", href: "/roles", icon: UserCheck },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Vendor Transaction", href: "/vendors", icon: Building2 },
  { name: "Customer Transaction", href: "/customers", icon: Users2 },
  { name: "Reports Analytics", href: "/reports", icon: FileText },
  { name: "Settings & Preferences", href: "/settings", icon: Settings },
]

export function Sidebar({ isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { businessInfo } = useBusiness()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-30 md:hidden",
          isMobileMenuOpen ? "block" : "hidden",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-lg transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">{businessInfo.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <SidebarContent location={location} handleLogout={handleLogout} />
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-white shadow-lg transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "flex items-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 relative",
            isSidebarCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className={cn("flex items-center space-x-2", isSidebarCollapsed ? "justify-center" : "")}>
            <DollarSign className="h-8 w-8 text-white flex-shrink-0" />
            {!isSidebarCollapsed && <span className="text-xl font-bold text-white">{businessInfo.name}</span>}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full text-white bg-white/10 hover:bg-white/20 absolute -right-3 top-1/2 -translate-y-1/2"
          >
            <ChevronLeft
              className={cn("h-6 w-6 transition-transform duration-300", isSidebarCollapsed && "rotate-180")}
            />
          </button>
        </div>
        <SidebarContent location={location} isSidebarCollapsed={isSidebarCollapsed} handleLogout={handleLogout} />
      </div>
    </>
  )
}

function SidebarContent({ location, isSidebarCollapsed = false, handleLogout }) {
  return (
    <>
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
                isSidebarCollapsed && "justify-center",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-700" : "text-gray-400",
                  !isSidebarCollapsed && "mr-3",
                )}
              />
              {!isSidebarCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200",
            isSidebarCollapsed && "justify-center",
          )}
        >
          <LogOut className={cn("h-5 w-5 flex-shrink-0", !isSidebarCollapsed && "mr-3")} />
          {!isSidebarCollapsed && "Logout"}
        </button>
      </div>
    </>
  )
}
