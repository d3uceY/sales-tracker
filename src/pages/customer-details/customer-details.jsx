"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionHistoryTable } from "../../components/contact/transaction-history-table"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Edit, Trash2 } from "lucide-react"
import { getCustomers, getCustomerTransactions } from "@/helpers/api/customers"
import Spinner from "@/components/ui/spinner"

export default function CustomerDetails() {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get("id")

  const [customer, setCustomer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails()
      fetchCustomerTransactions()
    }
  }, [customerId])

  const fetchCustomerDetails = async () => {
    try {
      const response = await getCustomers({ search: customerId })
      const foundCustomer = response.data?.find((c) => c.id === customerId)
      if (foundCustomer) {
        setCustomer(foundCustomer)
      } else {
        setError("Customer not found")
      }
    } catch (err) {
      setError("Failed to load customer details")
      console.error("Error fetching customer:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerTransactions = async () => {
    try {
      const response = await getCustomerTransactions(customerId, {
        page: 1,
        limit: 50,
      })
      setTransactions(response.data?.transactions || [])
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setTransactions([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error || "Customer not found"}</p>
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
          Back to Customers
        </Button>
        {/* <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Edit Customer
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div> */}
      </div>

      {/* Customer Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
              <Badge
                className={
                  customer.status === "active"
                    ? "bg-green-100 text-green-800 text-sm px-3 py-1"
                    : "bg-red-100 text-red-800 text-sm px-3 py-1"
                }
              >
                {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : "Inactive"}
              </Badge>
              <p className="text-gray-600 mt-3">Customer ID: {customer.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                <p className="text-lg text-gray-900">{customer.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                <p className="text-lg text-gray-900">{customer.phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-purple-600" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Home Address</p>
              <p className="text-lg text-gray-900">{customer.address || "Not provided"}</p>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Customer ID</p>
              <p className="text-lg font-mono text-gray-900">{customer.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Created Date</p>
              <p className="text-lg text-gray-900">
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString("en-US", {
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
                {customer.updatedAt
                  ? new Date(customer.updatedAt).toLocaleDateString("en-US", {
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
              : "No transactions found for this customer"}
          </p>
        </CardHeader>
        <CardContent>
          <TransactionHistoryTable transactions={transactions} type="customer" loading={false} />
        </CardContent>
      </Card>
    </div>
  )
}
