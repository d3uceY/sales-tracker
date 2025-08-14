"use client"

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
  ChevronDown,
  Contact,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../context/auth-context"
import { useBusiness } from "../../context/BusinessContext"
import { useState } from "react"

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Role Management", href: "/roles", icon: UserCheck },
  {
    name: "Contact",
    icon: Contact,
    isDropdown: true,
    children: [
      { name: "User Management", href: "/users", icon: Users },
      { name: "Customer Data", href: "/customer-data", icon: Users2 },
      { name: "Vendor Data", href: "/vendor-data", icon: Building2 },
    ],
  },
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
        className={cn("fixed inset-0 bg-black/50 z-30 md:hidden", isMobileMenuOpen ? "block" : "hidden")}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white shadow-lg transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "w-64 h-screen",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto">
          <SidebarContent location={location} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-white shadow-lg transition-all duration-300 h-screen",
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
        <div className="flex-1 overflow-y-auto">
          <SidebarContent location={location} isSidebarCollapsed={isSidebarCollapsed} handleLogout={handleLogout} />
        </div>
      </div>
    </>
  )
}

function SidebarContent({ location, isSidebarCollapsed = false, handleLogout }) {
  const [openDropdowns, setOpenDropdowns] = useState({})

  const toggleDropdown = (itemName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }))
  }

  const isDropdownActive = (children) => {
    return children.some((child) => location.pathname === child.href)
  }

  return (
    <>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          if (item.isDropdown) {
            const isOpen = openDropdowns[item.name]
            const hasActiveChild = isDropdownActive(item.children)

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={cn(
                    "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    hasActiveChild
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isSidebarCollapsed && "justify-center",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      hasActiveChild ? "text-blue-700" : "text-gray-400",
                      !isSidebarCollapsed && "mr-3",
                    )}
                  />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </>
                  )}
                </button>

                {!isSidebarCollapsed && isOpen && (
                  <div className="relative">
                    <div className="absolute left-0 right-0 z-10 ml-4 mt-1 space-y-1 bg-white rounded-lg shadow-lg p-2">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={cn(
                              "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <child.icon
                              className={cn(
                                "h-4 w-4 flex-shrink-0 mr-3",
                                isActive ? "text-blue-700" : "text-gray-400"
                              )}
                            />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          }

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
