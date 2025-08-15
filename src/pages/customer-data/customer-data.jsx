"use client"

import { useEffect, useCallback, useState } from "react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CustomerModal } from "../../components/contact/customer-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { TransactionHistoryTable } from "../../components/contact/transaction-history-table"
import { Plus, Search, Edit, Trash2, Users2, UserCheck, UserX, ChevronDown, ChevronRight } from "lucide-react"
import Spinner from "@/components/ui/spinner"
import PermissionRestricted from "@/components/permission-restricted"
import { getCustomers, getCustomerTransactions } from "@/helpers/api/customers"

export default function CustomerData() {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [expandedRows, setExpandedRows] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 })

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getCustomers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter
      })

      setCustomers(response.data)
      setTotalPages(response.pagination?.pages || 1)
      
      // Update stats
      const totalCustomers = response.pagination?.total || 0
      const activeCustomers = response.data?.filter(c => c.status === 'active').length || 0
      const inactiveCustomers = totalCustomers - activeCustomers
      
      setStats({
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
      })
    } catch (err) {
      setError("Failed to load customers.")
      console.error("Error fetching customers:", err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage])

  // Fetch transactions for a customer
  const fetchCustomerTransactions = useCallback(async (customerId) => {
    try {
      const response = await getCustomerTransactions(customerId, {
        page: 1,
        limit: 10
      })
      
      // Update the customer with transactions from the response
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === customerId 
            ? { 
                ...customer, 
                transactions: response.data?.transactions || [] 
              } 
            : customer
        )
      )
    } catch (err) {
      console.error("Error fetching transactions:", err)
      // Set empty transactions array if there's an error
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === customerId 
            ? { ...customer, transactions: [] } 
            : customer
        )
      )
    }
  }, [])

  // Toggle row expansion and fetch transactions if needed
  const toggleRowExpansion = useCallback(async (customerId) => {
    const isExpanded = !expandedRows[customerId]
    
    // If expanding and transactions aren't loaded yet, fetch them
    if (isExpanded) {
      const customer = customers.find(c => c.id === customerId)
      if (customer && (!customer.transactions || customer.transactions.length === 0)) {
        await fetchCustomerTransactions(customerId)
      }
    }
    
    setExpandedRows(prev => ({
      ...prev,
      [customerId]: isExpanded,
    }))
  }, [customers, expandedRows, fetchCustomerTransactions])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsCustomerModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsCustomerModalOpen(true)
  }

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const handleSaveCustomer = async (customerData) => {
    setLoading(true)
    setError("")
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (selectedCustomer) {
        toast.success("Customer updated successfully")
      } else {
        toast.success("Customer created successfully")
      }
      setIsCustomerModalOpen(false)
      fetchCustomers()
    } catch (err) {
      setError("Failed to save customer.")
      toast.error("Failed to save customer")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    setError("")
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success("Customer deleted successfully")
      setIsDeleteModalOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (err) {
      setError("Failed to delete customer.")
      toast.error("Failed to delete customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PermissionRestricted requiredPermission="read">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-2">Manage customer data and transaction history</p>
          </div>
          <Button onClick={handleAddCustomer} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Customers</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveCustomers}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900">All Customers</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="py-4 flex justify-center">
                <Spinner />
              </div>
            )}
            {error && <p className="text-center py-4 text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-8"></th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <>
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRowExpansion(customer.id)}
                              className="h-6 w-6"
                            >
                              {expandedRows[customer.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {customer.name
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{customer.email || '-'}</td>
                          <td className="py-4 px-4 text-gray-600">{customer.phone || '-'}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              className={
                                customer.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCustomer(customer)}
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCustomer(customer)}
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[customer.id] && (
                          <tr>
                            <td colSpan="6" className="py-4 px-4 bg-gray-50">
                              <TransactionHistoryTable 
                                transactions={Array.isArray(customer.transactions) ? customer.transactions : []} 
                                type="customer" 
                                loading={loading && customer.transactions === undefined}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {currentPage * itemsPerPage - itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, customers.length)} of {stats.totalCustomers} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSave={handleSaveCustomer}
          customer={selectedCustomer}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Customer"
          message={`Are you sure you want to delete the customer "${selectedCustomer?.name}"? This action cannot be undone.`}
        />
      </div>
    </PermissionRestricted>
  )
}
