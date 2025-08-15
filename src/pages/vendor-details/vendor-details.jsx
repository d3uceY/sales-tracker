"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionHistoryTable } from "../../components/contact/transaction-history-table"
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, User, Building, Edit, Trash2, CreditCard, DollarSign, Receipt } from "lucide-react"
import { getVendors, getVendorTransactions } from "@/helpers/api/vendors"
import Spinner from "@/components/ui/spinner"

export default function VendorDetails() {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const vendorId = searchParams.get("id")

  const [vendor, setVendor] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails()
      fetchVendorTransactions()
    }
  }, [vendorId])

  const fetchVendorDetails = async () => {
    try {
      const response = await getVendors({ search: vendorId })
      const foundVendor = response.data?.find((v) => v.id === vendorId)
      if (foundVendor) {
        setVendor(foundVendor)
      } else {
        setError("Vendor not found")
      }
    } catch (err) {
      setError("Failed to load vendor details")
      console.error("Error fetching vendor:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVendorTransactions = async () => {
    try {
      const response = await getVendorTransactions(vendorId, {
        page: 1,
        limit: 50,
      })
      setTransactions(response.data?.transactions || [])
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setTransactions([])
    }
  }

  // Calculate account summary data
  const getAccountSummary = () => {
    const totalTransactions = transactions.length
    const lastTransaction = transactions.length > 0 ? transactions[0] : null // Assuming transactions are sorted by date desc
    const outstandingBalance = lastTransaction?.outstandingBalance || 0
    const lastPaidAmount = lastTransaction?.paid || lastTransaction?.amountPaid || 0
    
    return {
      totalTransactions,
      outstandingBalance,
      lastPaidAmount
    }
  }

  const accountSummary = getAccountSummary()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error || "Vendor not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
        {/* <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Edit Vendor
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div> */}
      </div>

      {/* Vendor Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {vendor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.name}</h1>
              <Badge
                className={
                  vendor.status === "active"
                    ? "bg-green-100 text-green-800 text-sm px-3 py-1"
                    : "bg-red-100 text-red-800 text-sm px-3 py-1"
                }
              >
                {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : "Inactive"}
              </Badge>
              <p className="text-gray-600 mt-3">Vendor ID: {vendor.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{accountSummary.totalTransactions}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
              <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${accountSummary.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${accountSummary.lastPaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-purple-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Building2 className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Company Name</p>
                <p className="text-lg font-semibold text-gray-900">{vendor.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Contact Person</p>
                <p className="text-lg text-gray-900">{vendor.contactPerson || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                <p className="text-lg text-gray-900">{vendor.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                <p className="text-lg text-gray-900">{vendor.phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Business Address</p>
              <p className="text-lg text-gray-900">{vendor.address || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-orange-600" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Vendor ID</p>
              <p className="text-lg font-mono text-gray-900">{vendor.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Created Date</p>
              <p className="text-lg text-gray-900">
                {vendor.createdAt
                  ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
              <p className="text-lg text-gray-900">
                {vendor.updatedAt
                  ? new Date(vendor.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <p className="text-gray-600">
            {transactions.length > 0
              ? `${transactions.length} transaction(s) found`
              : "No transactions found for this vendor"}
          </p>
        </CardHeader>
        <CardContent>
          <TransactionHistoryTable transactions={transactions} type="vendor" loading={false} />
        </CardContent>
      </Card>
    </div>
  )
}