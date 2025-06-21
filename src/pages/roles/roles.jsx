"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RoleModal } from "../../components/admin/role-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"

// Mock data for roles
const initialRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 2,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Admin",
    description: "Administrative access with limited system settings",
    userCount: 5,
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Manager",
    description: "Can manage customers, vendors, and view reports",
    userCount: 8,
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    name: "Sales Rep",
    description: "Can create invoices and manage customer interactions",
    userCount: 12,
    createdAt: "2024-02-10",
  },
  {
    id: 5,
    name: "Accountant",
    description: "Financial data access and reporting capabilities",
    userCount: 3,
    createdAt: "2024-02-15",
  },
]

export default function Roles() {
  const [roles, setRoles] = useState(initialRoles)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter roles based on search term
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)

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

  const handleSaveRole = (roleData) => {
    if (selectedRole) {
      // Edit existing role
      setRoles(roles.map((role) => (role.id === selectedRole.id ? { ...role, ...roleData } : role)))
    } else {
      // Add new role
      const newRole = {
        id: Math.max(...roles.map((r) => r.id)) + 1,
        ...roleData,
        userCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setRoles([...roles, newRole])
    }
    setIsRoleModalOpen(false)
  }

  const handleConfirmDelete = () => {
    setRoles(roles.filter((role) => role.id !== selectedRole.id))
    setIsDeleteModalOpen(false)
    setSelectedRole(null)
  }

  return (
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
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.reduce((sum, role) => sum + role.userCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Used Role</p>
                <p className="text-2xl font-bold text-gray-900">Sales Rep</p>
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
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600 max-w-xs truncate">{role.description}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {role.userCount} users
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{role.createdAt}</td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRoles.length)} of{" "}
                {filteredRoles.length} results
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
  )
}
