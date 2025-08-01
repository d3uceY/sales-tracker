"use client"

import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useAuth } from "../../context/auth-context"
import { ChangePasswordModal } from "../auth/change-password-modal"
import { LogOut, SettingsIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"

const exchangeRates = [
  { currency: "USD/NGN", rate: "₦1,650" },
  { currency: "GBP/NGN", rate: "₦2,050" },
  { currency: "EUR/NGN", rate: "₦1,750" },
]

export function TopBar({ onMenuClick }) {
  const [selectedRate, setSelectedRate] = useState(exchangeRates[0])
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions, customers, vendors..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Exchange Rate Dropdown */}
          <div className="hidden md:flex">
            <Select
              defaultValue={selectedRate.currency}
              onValueChange={(value) => {
                const rate = exchangeRates.find((r) => r.currency === value)
                if (rate) setSelectedRate(rate)
              }}
            >
              <SelectTrigger className="bg-green-50 border-green-200 text-green-800 font-bold">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedRate.currency}:</span>
                    <span>{selectedRate.rate}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Exchange Rates</SelectLabel>
                  {exchangeRates.map((rate) => (
                    <SelectItem key={rate.currency} value={rate.currency}>
                      <div className="flex items-center justify-between w-full">
                        <span>{rate.currency}</span>
                        <span className="font-bold ml-4">{rate.rate}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || "John Adebayo"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
                </div>
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name || "John Adebayo"}</p>
                <p className="text-xs text-gray-500">{user?.email || "john@example.com"}</p>
              </div>
              <DropdownMenuSeparator />
              <ChangePasswordModal>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
              </ChangePasswordModal>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
