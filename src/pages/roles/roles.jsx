"use client"

import { useEffect, useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RoleModal } from "../../components/admin/role-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import { getRoles, createRole, updateRole, deleteRole } from "@/helpers/api/roles"
import { getUsers, getUserStats } from "@/helpers/api/users"
import { toast } from "react-hot-toast"
import Spinner from "@/components/ui/spinner"
import PermissionRestricted from '@/components/permission-restricted'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalResults, setTotalResults] = useState(0) // <-- add this
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ totalRoles: 0, activeUsers: 0, mostUsedRole: "" })
  const [users, setUsers] = useState([])

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      }
      const response = await getRoles(params)
      console.log("Roles API response:", response)
      
      // Extract data from the correct structure
      const rolesData = Array.isArray(response.data) ? response.data : []
      const paginationData = response.pagination || {}
      
      setRoles(rolesData)
      setTotalPages(paginationData.totalPages || 1)
      setTotalResults(paginationData.total || rolesData.length) // <-- set totalResults
      setStats((prev) => ({
        ...prev,
        totalRoles: paginationData.total || rolesData.length
      }))
    } catch (err) {
      console.error("Error fetching roles:", err)
      const message = err?.response?.data?.message || err?.message || "Failed to load roles."
      setError(typeof message === "string" ? message : JSON.stringify(message))
    } finally {
      setLoading(false)
    }
  }, [searchTerm, currentPage, itemsPerPage])

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      // Use the dedicated stats endpoint instead of fetching all users
      const statsData = await getUserStats()
      setStats((prev) => ({
        ...prev,
        activeUsers: statsData.activeUsers || statsData.active || 0
      }))
    } catch (err) {
      console.error("Error fetching user stats:", err)
      setStats((prev) => ({
        ...prev,
        activeUsers: 0
      }))
    }
  }, [])

  // Fetch stats from API
  // No longer needed, stats are computed from state

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Compute most used role from state
  useEffect(() => {
    // Most used role: role with highest userCount
    let mostUsedRole = "N/A"
    let maxUserCount = -1
    if (roles.length > 0) {
      for (const role of roles) {
        if (typeof role.userCount === "number" && role.userCount > maxUserCount) {
          maxUserCount = role.userCount
          mostUsedRole = role.name
        }
      }
    }
    setStats((prev) => ({
      ...prev,
      mostUsedRole
    }))
  }, [roles])

  const handleAddRole = () => {
    setSelectedRole(null)
    setIsRoleModalOpen(true)
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setIsRoleModalOpen(true)
  }

  const handleDeleteRole = (role) => {
    setSelectedRole(role)
    setIsDeleteModalOpen(true)
  }

  const handleSaveRole = async (roleData) => {
    setLoading(true)
    setError("")
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, roleData)
        toast.success("Role updated successfully")
      } else {
        await createRole(roleData)
        toast.success("Role created successfully")
      }
      setIsRoleModalOpen(false)
      fetchRoles()
      fetchStats()
    } catch (err) {
      console.error("Error saving role:", err)
      const message = err?.response?.data?.message || err?.message || (err.response && err.response.status === 409 ? "A role with this name already exists." : "Failed to save role.")
      const errorMsg = typeof message === "string" ? message : JSON.stringify(message)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    setError("")
    try {
      await deleteRole(selectedRole.id)
      toast.success("Role deleted successfully")
      setIsDeleteModalOpen(false)
      setSelectedRole(null)
      fetchRoles()
      fetchStats()
    } catch (err) {
      console.error("Error deleting role:", err)
      const message = err?.response?.data?.message || err?.message || "Failed to delete role."
      const errorMsg = typeof message === "string" ? message : JSON.stringify(message)
      setError(errorMsg)
      toast.error(errorMsg)
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
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
          </div>
          <Button onClick={handleAddRole} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{String(stats.totalRoles || 0)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* <Card>
           <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {String(stats.activeUsers || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card> */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Used Role</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.mostUsedRole || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900">All Roles</CardTitle>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="py-8 flex justify-center">
                <Spinner />
              </div>
            )}
            {error && <p className="text-center py-8 text-red-500">{error}</p>}
            {!loading && !error && (
              <>
                {roles.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No roles found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Role Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">Users</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{String(role.name || '')}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-gray-600 max-w-xs truncate">{String(role.description || '')}</div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {String(role.userCount || 0)} users
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-gray-600">{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditRole(role)}
                                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRole(role)}
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                  disabled={role.userCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {String((currentPage - 1) * itemsPerPage + 1)} to{" "}
                  {String(Math.min(currentPage * itemsPerPage, totalResults))} of{" "}
                  {String(totalResults)} results
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
        <RoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSave={handleSaveRole}
          role={selectedRole}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Role"
          message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
        />
      </div>
    </PermissionRestricted>
  )
}