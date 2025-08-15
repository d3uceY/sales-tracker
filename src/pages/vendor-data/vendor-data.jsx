"use client"

import { useEffect, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { VendorModal } from "../../components/contact/vendor-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { TransactionHistoryTable } from "../../components/contact/transaction-history-table"
import { Search, Edit, Trash2, Building2, UserCheck, UserX, ChevronDown, ChevronRight, Eye, Plus } from "lucide-react"
import Spinner from "@/components/ui/spinner"
import PermissionRestricted from "@/components/permission-restricted"
import { getVendors, getVendorTransactions, createVendor, updateVendor, deleteVendor } from "@/helpers/api/vendors"

export default function VendorData() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [expandedRows, setExpandedRows] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ totalVendors: 0, activeVendors: 0, inactiveVendors: 0 })

  // Fetch vendors from API
  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getVendors({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
      })

      setVendors(response.data)
      setTotalPages(response.pagination?.pages || 1)

      // Update stats
      const totalVendors = response.pagination?.total || 0
      const activeVendors = response.data?.filter((v) => v.status === "active").length || 0
      const inactiveVendors = totalVendors - activeVendors

      setStats({
        totalVendors,
        activeVendors,
        inactiveVendors,
      })
    } catch (err) {
      setError("Failed to load vendors.")
      console.error("Error fetching vendors:", err)
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage])

  // Fetch transactions for a vendor
  const fetchVendorTransactions = useCallback(async (vendorId) => {
    try {
      const response = await getVendorTransactions(vendorId, {
        page: 1,
        limit: 10,
      })

      // Update the vendor with transactions from the response
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor.id === vendorId
            ? {
                ...vendor,
                transactions: response.data?.transactions || [],
              }
            : vendor,
        ),
      )
    } catch (err) {
      console.error("Error fetching transactions:", err)
      // Set empty transactions array if there's an error
      setVendors((prevVendors) =>
        prevVendors.map((vendor) => (vendor.id === vendorId ? { ...vendor, transactions: [] } : vendor)),
      )
    }
  }, [])

  // Toggle row expansion and fetch transactions if needed
  const toggleRowExpansion = useCallback(
    async (vendorId) => {
      const isExpanded = !expandedRows[vendorId]

      // If expanding and transactions aren't loaded yet, fetch them
      if (isExpanded) {
        const vendor = vendors.find((v) => v.id === vendorId)
        if (vendor && (!vendor.transactions || vendor.transactions.length === 0)) {
          await fetchVendorTransactions(vendorId)
        }
      }

      setExpandedRows((prev) => ({
        ...prev,
        [vendorId]: isExpanded,
      }))
    },
    [vendors, expandedRows, fetchVendorTransactions],
  )

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleAddVendor = () => {
    setSelectedVendor(null)
    setIsVendorModalOpen(true)
  }

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsVendorModalOpen(true)
  }

  const handleViewVendor = (vendor) => {
    navigate(`/vendor-details?id=${vendor.id}`)
  }

  const handleDeleteVendor = (vendor) => {
    setSelectedVendor(vendor)
    setIsDeleteModalOpen(true)
  }

  const handleSaveVendor = async (vendorData) => {
    setLoading(true)
    setError("")
    try {
      if (selectedVendor) {
        await updateVendor(selectedVendor.id, vendorData)
        toast({
          title: "Success",
          description: "Vendor updated successfully",
        })
      } else {
        await createVendor(vendorData)
        toast({
          title: "Success",
          description: "Vendor created successfully",
        })
      }
      setIsVendorModalOpen(false)
      fetchVendors()
    } catch (err) {
      setError("Failed to save vendor.")
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    setError("")
    try {
      await deleteVendor(selectedVendor.id)
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      })
      setIsDeleteModalOpen(false)
      setSelectedVendor(null)
      fetchVendors()
    } catch (err) {
      setError("Failed to delete vendor.")
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      })
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
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600 mt-2">Manage vendor data and transaction history</p>
          </div>
          <Button variant="default" onClick={handleAddVendor} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <VendorModal
            onSave={handleSaveVendor}
            onCancel={() => setIsVendorModalOpen(false)}
            isOpen={isVendorModalOpen}
            onOpenChange={setIsVendorModalOpen}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeVendors}</p>
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
                  <p className="text-sm font-medium text-gray-600">Inactive Vendors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveVendors}</p>
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
              <CardTitle className="text-xl font-semibold text-gray-900">All Vendors</CardTitle>
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
                    placeholder="Search vendors..."
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Contact Person</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <>
                        <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRowExpansion(vendor.id)}
                              className="h-6 w-6"
                            >
                              {expandedRows[vendor.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {vendor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="font-medium text-gray-900">{vendor.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{vendor.contactPerson || "-"}</td>
                          <td className="py-4 px-4 text-gray-600">{vendor.email || "-"}</td>
                          <td className="py-4 px-4 text-gray-600">{vendor.phone || "-"}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              className={
                                vendor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {vendor.status
                                ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)
                                : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewVendor(vendor)} // Added eye icon button for viewing vendor details
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditVendor(vendor)}
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteVendor(vendor)}
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button> */}
                            </div>
                          </td>
                        </tr>
                        {expandedRows[vendor.id] && (
                          <tr>
                            <td colSpan="7" className="py-4 px-4 bg-gray-50">
                              <TransactionHistoryTable
                                transactions={Array.isArray(vendor.transactions) ? vendor.transactions : []}
                                type="vendor"
                                loading={loading && vendor.transactions === undefined}
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
                  {Math.min(currentPage * itemsPerPage, vendors.length)} of {stats.totalVendors} results
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
        <VendorModal
          isOpen={isVendorModalOpen}
          onClose={() => setIsVendorModalOpen(false)}
          onSave={handleSaveVendor}
          vendor={selectedVendor}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Vendor"
          message={`Are you sure you want to delete the vendor "${selectedVendor?.name}"? This action cannot be undone.`}
        />
      </div>
    </PermissionRestricted>
  )
}
