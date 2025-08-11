"use client"

import { useEffect, useCallback, useState } from "react"
import { getUsers, createUser, updateUser, deleteUser, getUserStats } from "@/helpers/api/users"
import { getRoles } from "@/helpers/api/roles"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserModal } from "../../components/admin/user-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Plus, Search, Edit, Trash2, UsersIcon, UserCheck, UserX } from "lucide-react"
import Spinner from "@/components/ui/spinner"
import PermissionRestricted from '@/components/permission-restricted'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, admins: 0 })
  const [availableRoles, setAvailableRoles] = useState([])

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = {
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: itemsPerPage,
      }
      const data = await getUsers(params)
      console.log("Users API response:", data)
      // Adjust this line if your backend returns a different key
      setUsers(data.users || data.data || data.results || [])
      setTotalPages(Math.ceil((data.total || (data.users ? data.users.length : (data.data ? data.data.length : 0))) / itemsPerPage))
    } catch (err) {
      setError("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage, itemsPerPage])

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const data = await getUserStats()
      console.log("User stats API response:", data)
      setStats({
        totalUsers: data.totalUsers || data.total || 0,
        activeUsers: data.activeUsers || data.active || 0,
        inactiveUsers: data.inactiveUsers || data.inactive || 0,
        admins: data.admins || 0,
      })
    } catch {
      // ignore stats error
    }
  }, [])

  // Fetch available roles for user modal
  const fetchAvailableRoles = useCallback(async () => {
    try {
      const data = await getRoles({})
      console.log("Roles for dropdown:", data)
      setAvailableRoles((data.roles || data.data || data.results || []).map((role) => role.name))
    } catch {
      setAvailableRoles([])
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchStats()
    fetchAvailableRoles()
  }, [fetchStats, fetchAvailableRoles])

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsUserModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleSaveUser = async (userData) => {
    setLoading(true)
    setError("")
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData)
        toast.success("User updated successfully")
      } else {
        await createUser(userData)
        toast.success("User created successfully")
      }
      setIsUserModalOpen(false)
      fetchUsers()
      fetchStats()
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("A user with this email or username already exists.")
        toast.error("A user with this email or username already exists.")
      } else {
        setError("Failed to save user.")
        toast.error("Failed to save user")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    setError("")
    try {
      await deleteUser(selectedUser.id)
      toast.success("User deleted successfully")
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
      fetchStats()
    } catch (err) {
      setError("Failed to delete user.")
      toast.error("Failed to delete user")
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage system users and their access</p>
          </div>
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
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
                  <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</p>
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
              <CardTitle className="text-xl font-semibold text-gray-900">All Users</CardTitle>
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
                    placeholder="Search users..."
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{user.email}</td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                            {user.role?.name || ""}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {currentPage * itemsPerPage - itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, users.length)} of{" "}
                  {stats.totalUsers} results
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
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
          user={selectedUser}
          availableRoles={availableRoles}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          message={`Are you sure you want to delete the user "${selectedUser?.name}"? This action cannot be undone.`}
        />
      </div>
    </PermissionRestricted>
  )
}
