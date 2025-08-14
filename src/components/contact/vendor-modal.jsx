"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "Egypt",
  "Morocco",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "India",
  "China",
  "Thailand",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
]

export function VendorModal({ isOpen, onClose, onSave, vendor }) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    status: "active",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    taxId: "",
    registrationNumber: "",
    website: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankBranch: "",
    swiftCode: "",
    iban: "",
    notes: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || "",
        contactPerson: vendor.contactPerson || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        status: vendor.status || "active",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "",
        postalCode: vendor.postalCode || "",
        taxId: vendor.taxId || "",
        registrationNumber: vendor.registrationNumber || "",
        website: vendor.website || "",
        bankName: vendor.bankName || "",
        bankAccountNumber: vendor.bankAccountNumber || "",
        bankAccountName: vendor.bankAccountName || "",
        bankBranch: vendor.bankBranch || "",
        swiftCode: vendor.swiftCode || "",
        iban: vendor.iban || "",
        notes: vendor.notes || "",
      })
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        status: "active",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        taxId: "",
        registrationNumber: "",
        website: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountName: "",
        bankBranch: "",
        swiftCode: "",
        iban: "",
        notes: "",
      })
    }
    setErrors({})
  }, [vendor, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website must be a valid URL (include http:// or https://)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {vendor ? "Edit Vendor" : "Create New Vendor"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter vendor name"
                  className={`mt-1 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  placeholder="Enter contact person name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={`mt-1 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address Information</h3>

            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter street address"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Enter city"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State/Province
                </Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Enter state or province"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Country
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="Enter postal code"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Business Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxId" className="text-sm font-medium text-gray-700">
                  Tax ID
                </Label>
                <Input
                  id="taxId"
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  placeholder="Enter tax ID"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                  Registration Number
                </Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  placeholder="Enter registration number"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
                className={`mt-1 ${errors.website ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Banking Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Enter bank name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-gray-700">
                  Bank Account Number
                </Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                  placeholder="Enter account number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bankAccountName" className="text-sm font-medium text-gray-700">
                  Bank Account Name
                </Label>
                <Input
                  id="bankAccountName"
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => handleChange("bankAccountName", e.target.value)}
                  placeholder="Enter account name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bankBranch" className="text-sm font-medium text-gray-700">
                  Bank Branch
                </Label>
                <Input
                  id="bankBranch"
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => handleChange("bankBranch", e.target.value)}
                  placeholder="Enter bank branch"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="swiftCode" className="text-sm font-medium text-gray-700">
                  SWIFT Code
                </Label>
                <Input
                  id="swiftCode"
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => handleChange("swiftCode", e.target.value)}
                  placeholder="Enter SWIFT code"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="iban" className="text-sm font-medium text-gray-700">
                  IBAN
                </Label>
                <Input
                  id="iban"
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                  placeholder="Enter IBAN"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Enter any additional notes"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {vendor ? "Update Vendor" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
