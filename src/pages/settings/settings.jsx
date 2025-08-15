"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemCategoryModal } from "../../components/settings/item-category-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Building2, DollarSign, Tag, Shield, Plus, Edit, Trash2, Save, Upload, X } from "lucide-react"
import { getBusinessInfo, updateBusinessInfo } from "@/helpers/api/business"
import { uploadBusinessLogo } from "@/helpers/api/business-logo"
import { getExchangeRate, updateExchangeRate } from "@/helpers/api/exchange-rate"
import {
  getItemCategories,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
} from "@/helpers/api/item-categories"
import { useBusiness } from "../../context/BusinessContext"
import PermissionRestricted from "@/components/permission-restricted"
import { toggleRolePermission, getAllRolesWithPermissions } from "@/helpers/api/role-permissions"

const initialCategories = [
  { id: 1, name: "Laptop", description: "Laptop computers and accessories", active: true },
  { id: 2, name: "Phone", description: "Mobile phones and smartphones", active: true },
  { id: 3, name: "Dollar", description: "USD currency transactions", active: true },
  { id: 4, name: "Tablet", description: "Tablet devices and accessories", active: false },
  { id: 5, name: "Other", description: "Miscellaneous items", active: true },
]

const userRoles = [
  {
    id: 1,
    role: "Super Admin",
    permissions: { read: true, create: true, update: true, delete: true },
  },
  {
    id: 2,
    role: "Admin",
    permissions: { read: true, create: true, update: true, delete: false },
  },
  {
    id: 3,
    role: "Manager",
    permissions: { read: true, create: true, update: false, delete: false },
  },
  {
    id: 4,
    role: "Sales Rep",
    permissions: { read: true, create: false, update: false, delete: false },
  },
]

export default function Settings() {
  const { updateBusinessInfo: updateBusinessContext, updateExchangeRates: updateExchangeContext, fetchBusinessData } = useBusiness()
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    email: "",
    logo: null,
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [businessLoading, setBusinessLoading] = useState(true)
  const [businessError, setBusinessError] = useState("")
  const [businessSaving, setBusinessSaving] = useState(false)
  const [businessSuccess, setBusinessSuccess] = useState("")

  const [exchangeRates, setExchangeRates] = useState({
    buyingRate: "",
    sellingRate: "",
  })
  const [exchangeLoading, setExchangeLoading] = useState(true)
  const [exchangeError, setExchangeError] = useState("")
  const [exchangeSaving, setExchangeSaving] = useState(false)
  const [exchangeSuccess, setExchangeSuccess] = useState("")

  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState("")
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryDeleting, setCategoryDeleting] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [permissions, setPermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(true)
  const [permissionLoading, setPermissionLoading] = useState(false)
  const [permissionError, setPermissionError] = useState("")
  const [permissionSuccess, setPermissionSuccess] = useState("")

  // Fetch roles with permissions
  const fetchRolesWithPermissions = async () => {
    setPermissionsLoading(true)
    setPermissionError("")
    try {
      const rolesData = await getAllRolesWithPermissions()
      // Transform backend data to match frontend structure
      const transformedRoles = rolesData.map((role) => {
        // Ensure Super Admin always shows full permissions
        const isSuperAdmin = role.name === "Super Admin"
        return {
          id: role.id,
          role: role.name,
          permissions: isSuperAdmin
            ? {
                read: true,
                create: true,
                update: true,
                delete: true,
              }
            : {
                read: role.permissions?.canRead || false,
                create: role.permissions?.canCreate || false,
                update: role.permissions?.canUpdate || false,
                delete: role.permissions?.canDelete || false,
              },
        }
      })
      setPermissions(transformedRoles)
    } catch (error) {
      setPermissionError("Failed to load roles and permissions")
      console.error("Error fetching roles:", error)
      // Fallback to hardcoded roles if API fails
      setPermissions(userRoles)
    } finally {
      setPermissionsLoading(false)
    }
  }

  useEffect(() => {
    setBusinessLoading(true)
    setBusinessError("")
    getBusinessInfo()
      .then((res) => {
        setBusinessInfo({
          name: res.data?.name || "",
          email: res.data?.email || "",
          logo: res.data?.logo || null,
        })
        if (res.data?.logo) {
          setLogoPreview(res.data.logo)
        }
      })
      .catch((err) => {
        setBusinessError("Failed to load business info")
      })
      .finally(() => setBusinessLoading(false))

    setExchangeLoading(true)
    setExchangeError("")
    getExchangeRate()
      .then((res) => {
        setExchangeRates({
          buyingRate: res.data?.buyRate?.toString() || "",
          sellingRate: res.data?.sellRate?.toString() || "",
        })
      })
      .catch(() => setExchangeError("Failed to load exchange rates"))
      .finally(() => setExchangeLoading(false))

    setCategoriesLoading(true)
    setCategoriesError("")
    getItemCategories()
      .then((res) => {
        setCategories(res.data || [])
      })
      .catch(() => setCategoriesError("Failed to load categories"))
      .finally(() => setCategoriesLoading(false))

    fetchRolesWithPermissions()
  }, [])

  const handleSaveBusinessInfo = async () => {
    setBusinessSaving(true)
    setBusinessError("")
    setBusinessSuccess("")
    try {
      // If logo is a File, upload it separately
      if (businessInfo.logo instanceof File) {
        await uploadBusinessLogo(businessInfo.logo)
        await fetchBusinessData()
        // Do NOT call updateBusinessContext here (let fetchBusinessData update the context with the new logo URL)
        return // Prevent running the rest of the function after logo upload
      }
      // Always update business info (name/email) as JSON
      await updateBusinessInfo({
        name: businessInfo.name,
        email: businessInfo.email,
      })
      updateBusinessContext({ ...businessInfo, logo: businessInfo.logo instanceof File ? logoPreview : businessInfo.logo })
      setBusinessSuccess("Business information saved successfully!")
    } catch (err) {
      setBusinessError("Failed to save business info")
    } finally {
      setBusinessSaving(false)
    }
  }

  const handleSaveExchangeRates = async () => {
    setExchangeSaving(true)
    setExchangeError("")
    setExchangeSuccess("")
    try {
      const newRates = {
        buyRate: Number(exchangeRates.buyingRate),
        sellRate: Number(exchangeRates.sellingRate),
      }
      await updateExchangeRate(newRates)
      updateExchangeContext(newRates)
      setExchangeSuccess("Exchange rate settings saved successfully!")
    } catch (err) {
      setExchangeError("Failed to save exchange rates")
    } finally {
      setExchangeSaving(false)
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleSaveCategory = async (categoryData) => {
    setCategorySaving(true)
    try {
      if (selectedCategory) {
        const updatedCategory = await updateItemCategory(selectedCategory.id, categoryData)
        setCategories(categories.map((cat) => (cat.id === selectedCategory.id ? updatedCategory.data : cat)))
      } else {
        const newCategory = await createItemCategory(categoryData)
        setCategories([...categories, newCategory.data])
      }
      setIsCategoryModalOpen(false)
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setCategorySaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    setCategoryDeleting(true)
    try {
      await deleteItemCategory(selectedCategory.id)
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id))
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setCategoryDeleting(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setBusinessError("Please select a valid image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setBusinessError("Image size must be less than 5MB")
        return
      }
      setBusinessSaving(true)
      setBusinessError("")
      setBusinessSuccess("")
      try {
        const previewUrl = URL.createObjectURL(file)
        setLogoPreview(previewUrl)
        setBusinessInfo({ ...businessInfo, logo: file })
        await uploadBusinessLogo(file)
        setBusinessSuccess("Logo uploaded successfully!")
      } catch (err) {
        setBusinessError("Failed to upload logo")
      } finally {
        setBusinessSaving(false)
      }
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setBusinessInfo({ ...businessInfo, logo: null })
    const fileInput = document.getElementById("logoUpload")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const togglePermission = async (roleId, permission) => {
    setPermissionLoading(true)
    setPermissionError("")
    setPermissionSuccess("")

    try {
      const currentRole = permissions.find((role) => role.id === roleId)

      if (currentRole.role === "Super Admin") {
        setPermissionError("Super Admin permissions cannot be modified. Super Admin always has full access.")
        setPermissionLoading(false)
        return
      }

      const newValue = !currentRole.permissions[permission]

      await toggleRolePermission(roleId, permission)

      setPermissions(
        permissions.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions: {
                  ...role.permissions,
                  [permission]: newValue,
                },
              }
            : role,
        ),
      )

      setPermissionSuccess("Permission updated successfully")

      setTimeout(() => setPermissionSuccess(""), 3000)
    } catch (error) {
      setPermissionError(error.message || "Failed to update permission")
      console.error("Permission toggle error:", error)
    } finally {
      setPermissionLoading(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Configure your application preferences and business settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-4 lg:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-max">
            <TabsTrigger value="business" className="text-xs lg:text-sm">
              Business
            </TabsTrigger>
            <TabsTrigger value="exchange" className="text-xs lg:text-sm">
              Exchange
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs lg:text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs lg:text-sm">
              Permissions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Business Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {businessLoading && <div className="text-blue-600 text-sm">Loading business info...</div>}
              {businessError && <div className="text-red-600 text-sm">{businessError}</div>}
              {businessSuccess && <div className="text-green-600 text-sm">{businessSuccess}</div>}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Business Logo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Business Logo"
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={businessLoading || businessSaving}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor="logoUpload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {logoPreview ? "Change Logo" : "Upload Logo"}
                      </label>
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={businessLoading || businessSaving}
                      />
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB. Recommended size: 200x200px</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    className="mt-1"
                    disabled={businessLoading || businessSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    className="mt-1"
                    disabled={businessLoading || businessSaving}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveBusinessInfo}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={businessLoading || businessSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {businessSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle>Exchange Rate Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {exchangeLoading && <div className="text-blue-600 text-sm">Loading exchange rates...</div>}
              {exchangeError && <div className="text-red-600 text-sm">{exchangeError}</div>}
              {exchangeSuccess && <div className="text-green-600 text-sm">{exchangeSuccess}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buyingRate">Default Buying Rate (USD to NGN)</Label>
                  <Input
                    id="buyingRate"
                    type="number"
                    step="0.01"
                    value={exchangeRates.buyingRate}
                    onChange={(e) => setExchangeRates({ ...exchangeRates, buyingRate: e.target.value })}
                    className="mt-1"
                    disabled={exchangeLoading || exchangeSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingRate">Default Selling Rate (USD to NGN)</Label>
                  <Input
                    id="sellingRate"
                    type="number"
                    step="0.01"
                    value={exchangeRates.sellingRate}
                    onChange={(e) => setExchangeRates({ ...exchangeRates, sellingRate: e.target.value })}
                    className="mt-1"
                    disabled={exchangeLoading || exchangeSaving}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveExchangeRates}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={exchangeLoading || exchangeSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {exchangeSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  <CardTitle>Item Categories</CardTitle>
                </div>
                <Button onClick={handleAddCategory} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading && <div className="text-purple-600 text-sm">Loading categories...</div>}
              {categoriesError && <div className="text-red-600 text-sm">{categoriesError}</div>}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{category.name}</td>
                        <td className="py-4 px-4 text-gray-600">{category.description}</td>
                        <td className="py-4 px-4 text-center">
                          <Badge
                            className={category.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {category.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                              className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600"
                              disabled={categorySaving || categoryDeleting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category)}
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              disabled={categorySaving || categoryDeleting}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionRestricted requiredRole="Admin">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <CardTitle>User Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {permissionError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{permissionError}</p>
                  </div>
                )}
                {permissionSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">{permissionSuccess}</p>
                  </div>
                )}
                {permissionsLoading && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-600">Loading roles and permissions...</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Read</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Create</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Update</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((role) => {
                        const isSuperAdmin = role.role === "Super Admin"
                        return (
                          <tr
                            key={role.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${isSuperAdmin ? "bg-blue-50" : ""}`}
                          >
                            <td className="py-4 px-4 font-medium text-gray-900">
                              {role.role}
                              {isSuperAdmin && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Locked
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Switch
                                checked={role.permissions.read}
                                onCheckedChange={() => togglePermission(role.id, "read")}
                                disabled={permissionLoading || isSuperAdmin}
                                size="sm"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Switch
                                checked={role.permissions.create}
                                onCheckedChange={() => togglePermission(role.id, "create")}
                                disabled={permissionLoading || isSuperAdmin}
                                size="sm"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Switch
                                checked={role.permissions.update}
                                onCheckedChange={() => togglePermission(role.id, "update")}
                                disabled={permissionLoading || isSuperAdmin}
                                size="sm"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Switch
                                checked={role.permissions.delete}
                                onCheckedChange={() => togglePermission(role.id, "delete")}
                                disabled={permissionLoading || isSuperAdmin}
                                size="sm"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PermissionRestricted>
        </TabsContent>
      </Tabs>

      <ItemCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        loading={categorySaving}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${selectedCategory?.name}"? This action cannot be undone.`}
        loading={categoryDeleting}
      />
    </div>
  )
}
