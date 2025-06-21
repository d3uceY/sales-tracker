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

const exchangeRates = [
  { currency: "USD/NGN", rate: "₦1,650" },
  { currency: "GBP/NGN", rate: "₦2,050" },
  { currency: "EUR/NGN", rate: "₦1,750" },
]

export function TopBar({ onMenuClick }) {
  const [selectedRate, setSelectedRate] = useState(exchangeRates[0])

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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">John Adebayo</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
