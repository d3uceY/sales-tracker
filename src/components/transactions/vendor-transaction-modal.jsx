"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { getVendors, createVendor } from "@/helpers/api/vendors"
import { getItemCategories, createItemCategory } from "@/helpers/api/item-categories"
import { useBusiness } from "../../context/BusinessContext"
import { updateExchangeRate } from "../../helpers/api/exchange-rate"

const vendorNames = ["Best Buy", "Amazon", "Newegg", "B&H Photo", "Walmart", "Currency Exchange", "Other"]

export function VendorTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const { exchangeRates: exchangeRatesData, updateExchangeRates } = useBusiness()
  const [formData, setFormData] = useState({
    vendorName: "",
    customVendorName: "",
    itemPurchased: "",
    customItemName: "",
    transactionDate: "",
    quantity: "",
    priceNGN: "",
    exchangeRate: "",
    priceUSD: "",
    otherExpensesUSD: "0",
    otherExpensesNGN: "0",
    paymentStatus: "unpaid",
    amountPaid: "",
  })
  const [errors, setErrors] = useState({})
  const [vendors, setVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  // Fetch vendors and categories on open
  useEffect(() => {
    if (isOpen) {
      setLoadingVendors(true)
      setLoadingCategories(true)
      
      // Fetch vendors
      getVendors()
        .then((res) => {
          setVendors(res.data || [])
        })
        .catch(() => setVendors([]))
        .finally(() => setLoadingVendors(false))
      
      // Fetch categories
      getItemCategories()
        .then((res) => {
          setCategories(res.data || [])
        })
        .catch(() => setCategories([]))
        .finally(() => setLoadingCategories(false))
    }
  }, [isOpen])

  useEffect(() => {
    if (transaction) {
      setFormData({
        vendorName: transaction.vendorName === "Other" ? "Other" : transaction.vendorName,
        customVendorName: transaction.vendorName === "Other" ? "" : transaction.vendorName,
        itemPurchased: transaction.itemPurchased === "Other" ? "Other" : transaction.itemPurchased,
        customItemName: transaction.itemPurchased === "Other" ? "" : transaction.itemPurchased,
        transactionDate: transaction.transactionDate,
        quantity: transaction.quantity.toString(),
        priceNGN: transaction.priceNGN ? transaction.priceNGN.toString() : "",
        exchangeRate: transaction.exchangeRate ? transaction.exchangeRate.toString() : exchangeRatesData.buyRate?.toString() || "1500",
        priceUSD: transaction.priceUSD ? transaction.priceUSD.toString() : "",
        otherExpensesUSD: transaction.otherExpensesUSD ? transaction.otherExpensesUSD.toString() : "0",
        otherExpensesNGN: transaction.otherExpensesNGN ? transaction.otherExpensesNGN.toString() : "0",
        paymentStatus: transaction.paymentStatus,
        amountPaid: transaction.amountPaid ? transaction.amountPaid.toString() : "",
      })
    } else {
      setFormData({
        vendorName: "",
        customVendorName: "",
        itemPurchased: "",
        customItemName: "",
        transactionDate: new Date().toISOString().split("T")[0],
        quantity: "",
        priceNGN: "",
        exchangeRate: exchangeRatesData.buyRate?.toString() || "1500",
        priceUSD: "",
        otherExpensesUSD: "0",
        otherExpensesNGN: "0",
        paymentStatus: "unpaid",
        amountPaid: "",
      })
    }
    setErrors({})
  }, [transaction, isOpen, exchangeRatesData.buyRate])

  // Auto-calculate priceUSD when priceNGN and exchangeRate change
  useEffect(() => {
    if (formData.priceNGN && formData.exchangeRate) {
      const ngn = parseFloat(formData.priceNGN) || 0;
      const rate = parseFloat(formData.exchangeRate) || 1;
      const usd = ngn / rate;
      setFormData((prev) => ({ ...prev, priceUSD: usd ? usd.toFixed(2) : "" }));
    }
  }, [formData.priceNGN, formData.exchangeRate]);

  // Auto-calculate otherExpensesNGN when otherExpensesUSD and exchangeRate change
  useEffect(() => {
    if (formData.otherExpensesUSD && formData.exchangeRate) {
      const usd = parseFloat(formData.otherExpensesUSD) || 0;
      const rate = parseFloat(formData.exchangeRate) || 1;
      const ngn = usd * rate;
      setFormData((prev) => ({ ...prev, otherExpensesNGN: ngn ? ngn.toFixed(2) : "0" }));
    }
  }, [formData.otherExpensesUSD, formData.exchangeRate]);

  // Calculate totals based on new structure
  const totalNGN = (Number.parseFloat(formData.priceNGN) || 0) + (Number.parseFloat(formData.otherExpensesNGN) || 0)
  const totalUSD = (Number.parseFloat(formData.priceUSD) || 0) + (Number.parseFloat(formData.otherExpensesUSD) || 0)

  const validateForm = () => {
    const newErrors = {}

    const finalVendorName = formData.vendorName === "Other" ? formData.customVendorName : formData.vendorName
    const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

    if (!finalVendorName.trim()) newErrors.vendorName = "Vendor name is required"
    if (!finalItemName.trim()) newErrors.itemPurchased = "Item type is required"
    if (!formData.transactionDate) newErrors.transactionDate = "Transaction date is required"
    if (!formData.quantity || Number.parseFloat(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required"
    if (!formData.priceNGN || Number.parseFloat(formData.priceNGN) <= 0)
      newErrors.priceNGN = "Valid price in NGN is required"
    if (!formData.exchangeRate || Number.parseFloat(formData.exchangeRate) <= 0)
      newErrors.exchangeRate = "Valid exchange rate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError("")
    if (!validateForm()) return
    setSubmitLoading(true)
    try {
      let vendorId = null
      let vendorName = formData.vendorName === "Other" ? formData.customVendorName : formData.vendorName
      // If 'Other', create vendor first
      if (formData.vendorName === "Other") {
        const newVendor = await createVendor({ name: vendorName })
        vendorId = newVendor.data?.id
        // Optionally, refresh vendor list
        setVendors((prev) => [...prev, newVendor.data])
      } else {
        const selected = vendors.find((v) => v.name === vendorName)
        vendorId = selected?.id
      }
      if (!vendorId) throw new Error("Vendor not found or created.")
      
      // Handle item category creation if "Other" is selected
      let finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased
      if (formData.itemPurchased === "Other" && formData.customItemName) {
        try {
          const newCategory = await createItemCategory({ 
            name: formData.customItemName, 
            description: "User added from vendor transaction",
            active: true 
          })
          // Refresh categories list
          setCategories((prev) => [...prev, newCategory.data])
        } catch (error) {
          console.error('Error creating category:', error)
          // Continue with the transaction even if category creation fails
        }
      }
      
      // Update exchange rate if it's different from the default buy rate
      const newExchangeRate = Number.parseFloat(formData.exchangeRate)
      if (newExchangeRate !== exchangeRatesData.buyRate) {
        try {
          await updateExchangeRate({
            buyRate: newExchangeRate,
            sellRate: exchangeRatesData.sellRate
          })
          // Update the context with new rates
          updateExchangeRates({
            buyRate: newExchangeRate,
            sellRate: exchangeRatesData.sellRate
          })
        } catch (error) {
          console.error('Error updating exchange rate:', error)
          // Continue with the transaction even if rate update fails
        }
      }
      
      const amountPaidValue = Number.parseFloat(formData.amountPaid) || totalUSD;
      
      // Prepare transaction payload
      const transactionData = {
        itemPurchased: finalItemName,
        transactionDate: formData.transactionDate,
        quantity: Number.parseFloat(formData.quantity),
        priceNGN: Number.parseFloat(formData.priceNGN),
        exchangeRate: Number.parseFloat(formData.exchangeRate),
        priceUSD: Number.parseFloat(formData.priceUSD),
        otherExpensesUSD: Number.parseFloat(formData.otherExpensesUSD) || 0,
        otherExpensesNGN: Number.parseFloat(formData.otherExpensesNGN) || 0,
        paymentStatus: amountPaidValue < totalUSD ? "partial" : "paid",
        totalNGN: totalNGN,
        totalUSD: totalUSD,
        amountPaid: amountPaidValue,
      }
      // Call create transaction API
      const { createVendorTransaction } = await import("@/helpers/api/transaction")
      await createVendorTransaction(vendorId, transactionData)
      onSave && onSave({ ...transactionData, vendorName, vendorId })
      onClose && onClose()
    } catch (err) {
      setApiError(err.message || "Failed to create transaction.")
    } finally {
      setSubmitLoading(false)
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
        {apiError && <div className="text-red-600 text-sm mb-2">{apiError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700">
                Vendor Name *
              </Label>
              <Select
                value={formData.vendorName}
                onValueChange={(value) => handleChange("vendorName", value)}
                disabled={loadingVendors}
              >
                <SelectTrigger className={`mt-1 ${errors.vendorName ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={loadingVendors ? "Loading vendors..." : "Select vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
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
                  <SelectValue placeholder={loadingCategories ? "Loading items..." : "Select item type"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.active).map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
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
              <Label htmlFor="priceNGN" className="text-sm font-medium text-gray-700">
                Price (NGN) *
              </Label>
              <Input
                id="priceNGN"
                type="number"
                step="0.01"
                value={formData.priceNGN}
                onChange={(e) => handleChange("priceNGN", e.target.value)}
                placeholder="0.00"
                className={`mt-1 ${errors.priceNGN ? "border-red-500" : ""}`}
              />
              {errors.priceNGN && <p className="mt-1 text-sm text-red-600">{errors.priceNGN}</p>}
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
                placeholder="1500.00"
                className={`mt-1 ${errors.exchangeRate ? "border-red-500" : ""}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Default buy rate: ₦{exchangeRatesData.buyRate?.toLocaleString() || "1,650"}. 
                Changing this will update the default rate.
              </p>
              {errors.exchangeRate && <p className="mt-1 text-sm text-red-600">{errors.exchangeRate}</p>}
            </div>

            <div>
              <Label htmlFor="priceUSD" className="text-sm font-medium text-gray-700">
                Price (USD)
              </Label>
              <Input
                id="priceUSD"
                type="number"
                step="0.01"
                value={formData.priceUSD}
                readOnly
                placeholder="0.00"
                className="mt-1 bg-gray-100 cursor-not-allowed"
                tabIndex={-1}
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from NGN price</p>
            </div>

            <div>
              <Label htmlFor="amountPaid" className="text-sm font-medium text-gray-700">
                Amount Paid (USD)
              </Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                value={formData.amountPaid || totalUSD.toFixed(2)}
                onChange={(e) => handleChange("amountPaid", e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to mark as fully paid</p>
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
                  <SelectItem value="partial">Partial</SelectItem>
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
                <span className="text-gray-600">Price (USD):</span>
                <p className="font-mono font-medium">${formData.priceUSD || "0.00"}</p>
              </div>
              <div>
                <span className="text-gray-600">Total (NGN):</span>
                <p className="font-mono font-medium">₦{totalNGN.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Total (USD):</span>
                <p className="font-mono font-medium">${totalUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitLoading}>
              {submitLoading ? "Saving..." : transaction ? "Update Transaction" : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
