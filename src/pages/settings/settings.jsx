"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemCategoryModal } from "../../components/settings/item-category-modal"
import { DeleteConfirmModal } from "../../components/admin/delete-confirm-modal"
import { Building2, DollarSign, Tag, Bell, Download, Shield, Plus, Edit, Trash2, Save } from "lucide-react"
import { getBusinessInfo, updateBusinessInfo } from "@/helpers/api/business"
import { getExchangeRate, updateExchangeRate } from "@/helpers/api/exchange-rate"
import { getItemCategories, createItemCategory, updateItemCategory, deleteItemCategory } from "@/helpers/api/item-categories"
import { useBusiness } from "../../context/BusinessContext"

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
  const { updateBusinessInfo: updateBusinessContext, updateExchangeRates: updateExchangeContext } = useBusiness()
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    email: "",
  })
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

  const [permissions, setPermissions] = useState(userRoles)

  useEffect(() => {
    setBusinessLoading(true)
    setBusinessError("")
    getBusinessInfo()
      .then((res) => {
        setBusinessInfo({
          name: res.data?.name || "",
          email: res.data?.email || "",
        })
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
  }, [])

  const handleSaveBusinessInfo = async () => {
    setBusinessSaving(true)
    setBusinessError("")
    setBusinessSuccess("")
    try {
      await updateBusinessInfo(businessInfo)
      // Update the global business context
      updateBusinessContext(businessInfo)
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
      // Update the global exchange rates context
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
        // Update existing category
        const updatedCategory = await updateItemCategory(selectedCategory.id, categoryData)
        setCategories(categories.map((cat) => (cat.id === selectedCategory.id ? updatedCategory.data : cat)))
      } else {
        // Create new category
        const newCategory = await createItemCategory(categoryData)
        setCategories([...categories, newCategory.data])
      }
      setIsCategoryModalOpen(false)
    } catch (error) {
      console.error('Error saving category:', error)
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
      console.error('Error deleting category:', error)
    } finally {
      setCategoryDeleting(false)
    }
  }


  const togglePermission = (roleId, permission) => {
    setPermissions(
      permissions.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [permission]: !role.permissions[permission],
              },
            }
          : role,
      ),
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Configure your application preferences and business settings
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
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

        {/* Business Info */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Business Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {businessLoading && (
                <div className="text-blue-600 text-sm">Loading business info...</div>
              )}
              {businessError && (
                <div className="text-red-600 text-sm">{businessError}</div>
              )}
              {businessSuccess && (
                <div className="text-green-600 text-sm">{businessSuccess}</div>
              )}
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
                <Button onClick={handleSaveBusinessInfo} className="bg-blue-600 hover:bg-blue-700" disabled={businessLoading || businessSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {businessSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Rate Settings */}
        <TabsContent value="exchange">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <CardTitle>Exchange Rate Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {exchangeLoading && (
                <div className="text-blue-600 text-sm">Loading exchange rates...</div>
              )}
              {exchangeError && (
                <div className="text-red-600 text-sm">{exchangeError}</div>
              )}
              {exchangeSuccess && (
                <div className="text-green-600 text-sm">{exchangeSuccess}</div>
              )}
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
                <Button onClick={handleSaveExchangeRates} className="bg-green-600 hover:bg-green-700" disabled={exchangeLoading || exchangeSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {exchangeSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Item Categories */}
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
              {categoriesLoading && (
                <div className="text-purple-600 text-sm">Loading categories...</div>
              )}
              {categoriesError && (
                <div className="text-red-600 text-sm">{categoriesError}</div>
              )}
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

        {/* User Permissions */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <CardTitle>User Permissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
                    {permissions.map((role) => (
                      <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{role.role}</td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={role.permissions.read}
                            onCheckedChange={() => togglePermission(role.id, "read")}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={role.permissions.create}
                            onCheckedChange={() => togglePermission(role.id, "create")}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={role.permissions.update}
                            onCheckedChange={() => togglePermission(role.id, "update")}
                            size="sm"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={role.permissions.delete}
                            onCheckedChange={() => togglePermission(role.id, "delete")}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
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
