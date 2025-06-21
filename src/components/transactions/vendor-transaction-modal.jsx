"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

const vendorNames = ["Best Buy", "Amazon", "Newegg", "B&H Photo", "Walmart", "Currency Exchange", "Other"]
const itemTypes = ["Laptop", "Phone", "Dollar", "Other"]

export function VendorTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [formData, setFormData] = useState({
    vendorName: "",
    customVendorName: "",
    itemPurchased: "",
    customItemName: "",
    transactionDate: "",
    quantity: "",
    amountUSD: "",
    exchangeRate: "1650",
    otherExpensesUSD: "0",
    otherExpensesNGN: "0",
    paymentStatus: "unpaid",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (transaction) {
      setFormData({
        vendorName: transaction.vendorName === "Other" ? "Other" : transaction.vendorName,
        customVendorName: transaction.vendorName === "Other" ? "" : transaction.vendorName,
        itemPurchased: transaction.itemPurchased === "Other" ? "Other" : transaction.itemPurchased,
        customItemName: transaction.itemPurchased === "Other" ? "" : transaction.itemPurchased,
        transactionDate: transaction.transactionDate,
        quantity: transaction.quantity.toString(),
        amountUSD: transaction.amountUSD.toString(),
        exchangeRate: transaction.exchangeRate.toString(),
        otherExpensesUSD: transaction.otherExpensesUSD.toString(),
        otherExpensesNGN: transaction.otherExpensesNGN.toString(),
        paymentStatus: transaction.paymentStatus,
      })
    } else {
      setFormData({
        vendorName: "",
        customVendorName: "",
        itemPurchased: "",
        customItemName: "",
        transactionDate: new Date().toISOString().split("T")[0],
        quantity: "",
        amountUSD: "",
        exchangeRate: "1650",
        otherExpensesUSD: "0",
        otherExpensesNGN: "0",
        paymentStatus: "unpaid",
      })
    }
    setErrors({})
  }, [transaction, isOpen])

  // Auto-calculate NGN amounts
  const amountNGN = (Number.parseFloat(formData.amountUSD) || 0) * (Number.parseFloat(formData.exchangeRate) || 0)
  const totalUSD = (Number.parseFloat(formData.amountUSD) || 0) + (Number.parseFloat(formData.otherExpensesUSD) || 0)
  const totalNGN = amountNGN + (Number.parseFloat(formData.otherExpensesNGN) || 0)

  const validateForm = () => {
    const newErrors = {}

    const finalVendorName = formData.vendorName === "Other" ? formData.customVendorName : formData.vendorName
    const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

    if (!finalVendorName.trim()) newErrors.vendorName = "Vendor name is required"
    if (!finalItemName.trim()) newErrors.itemPurchased = "Item type is required"
    if (!formData.transactionDate) newErrors.transactionDate = "Transaction date is required"
    if (!formData.quantity || Number.parseFloat(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required"
    if (!formData.amountUSD || Number.parseFloat(formData.amountUSD) <= 0)
      newErrors.amountUSD = "Valid amount is required"
    if (!formData.exchangeRate || Number.parseFloat(formData.exchangeRate) <= 0)
      newErrors.exchangeRate = "Valid exchange rate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const finalVendorName = formData.vendorName === "Other" ? formData.customVendorName : formData.vendorName
      const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

      const transactionData = {
        vendorName: finalVendorName,
        itemPurchased: finalItemName,
        transactionDate: formData.transactionDate,
        quantity: Number.parseFloat(formData.quantity),
        amountUSD: Number.parseFloat(formData.amountUSD),
        exchangeRate: Number.parseFloat(formData.exchangeRate),
        amountNGN: amountNGN,
        otherExpensesUSD: Number.parseFloat(formData.otherExpensesUSD) || 0,
        otherExpensesNGN: Number.parseFloat(formData.otherExpensesNGN) || 0,
        paymentStatus: formData.paymentStatus,
        totalUSD: totalUSD,
        totalNGN: totalNGN,
      }
      onSave(transactionData)
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {transaction ? "Edit Vendor Transaction" : "Create Vendor Transaction"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700">
                Vendor Name *
              </Label>
              <Select value={formData.vendorName} onValueChange={(value) => handleChange("vendorName", value)}>
                <SelectTrigger className={`mt-1 ${errors.vendorName ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorNames.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.vendorName === "Other" && (
                <Input
                  placeholder="Enter vendor name"
                  value={formData.customVendorName}
                  onChange={(e) => handleChange("customVendorName", e.target.value)}
                  className="mt-2"
                />
              )}
              {errors.vendorName && <p className="mt-1 text-sm text-red-600">{errors.vendorName}</p>}
            </div>

            <div>
              <Label htmlFor="itemPurchased" className="text-sm font-medium text-gray-700">
                Item Purchased *
              </Label>
              <Select value={formData.itemPurchased} onValueChange={(value) => handleChange("itemPurchased", value)}>
                <SelectTrigger className={`mt-1 ${errors.itemPurchased ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.itemPurchased === "Other" && (
                <Input
                  placeholder="Enter item name"
                  value={formData.customItemName}
                  onChange={(e) => handleChange("customItemName", e.target.value)}
                  className="mt-2"
                />
              )}
              {errors.itemPurchased && <p className="mt-1 text-sm text-red-600">{errors.itemPurchased}</p>}
            </div>

            <div>
              <Label htmlFor="transactionDate" className="text-sm font-medium text-gray-700">
                Transaction Date *
              </Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => handleChange("transactionDate", e.target.value)}
                className={`mt-1 ${errors.transactionDate ? "border-red-500" : ""}`}
              />
              {errors.transactionDate && <p className="mt-1 text-sm text-red-600">{errors.transactionDate}</p>}
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder={formData.itemPurchased === "Dollar" ? "Amount in USD" : "Number of units"}
                className={`mt-1 ${errors.quantity ? "border-red-500" : ""}`}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              <Label htmlFor="amountUSD" className="text-sm font-medium text-gray-700">
                Amount (USD) *
              </Label>
              <Input
                id="amountUSD"
                type="number"
                step="0.01"
                value={formData.amountUSD}
                onChange={(e) => handleChange("amountUSD", e.target.value)}
                placeholder="0.00"
                className={`mt-1 ${errors.amountUSD ? "border-red-500" : ""}`}
              />
              {errors.amountUSD && <p className="mt-1 text-sm text-red-600">{errors.amountUSD}</p>}
            </div>

            <div>
              <Label htmlFor="exchangeRate" className="text-sm font-medium text-gray-700">
                Exchange Rate (USD to NGN) *
              </Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.01"
                value={formData.exchangeRate}
                onChange={(e) => handleChange("exchangeRate", e.target.value)}
                placeholder="1650.00"
                className={`mt-1 ${errors.exchangeRate ? "border-red-500" : ""}`}
              />
              {errors.exchangeRate && <p className="mt-1 text-sm text-red-600">{errors.exchangeRate}</p>}
            </div>

            <div>
              <Label htmlFor="otherExpensesUSD" className="text-sm font-medium text-gray-700">
                Other Expenses (USD)
              </Label>
              <Input
                id="otherExpensesUSD"
                type="number"
                step="0.01"
                value={formData.otherExpensesUSD}
                onChange={(e) => handleChange("otherExpensesUSD", e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="otherExpensesNGN" className="text-sm font-medium text-gray-700">
                Other Expenses (NGN)
              </Label>
              <Input
                id="otherExpensesNGN"
                type="number"
                step="0.01"
                value={formData.otherExpensesNGN}
                onChange={(e) => handleChange("otherExpensesNGN", e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
                Payment Status
              </Label>
              <Select value={formData.paymentStatus} onValueChange={(value) => handleChange("paymentStatus", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculated Values */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount (NGN):</span>
                <p className="font-mono font-medium">₦{amountNGN.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Total (USD):</span>
                <p className="font-mono font-medium">${totalUSD.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total (NGN):</span>
                <p className="font-mono font-medium">₦{totalNGN.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {transaction ? "Update Transaction" : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
