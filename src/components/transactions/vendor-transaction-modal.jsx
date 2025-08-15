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
import { formatMoney, parseMoney } from "../../utils/formatters"
import { getVendorBalanceByName } from "@/helpers/api/vendors"
import { calculateNewBalance, formatBalanceStatus } from "../../helpers/balance/balance-calculator"

const vendorNames = ["Best Buy", "Amazon", "Newegg", "B&H Photo", "Walmart", "Currency Exchange", "Other"]

export const VendorTransactionModal = ({ isOpen, onClose, onSave, transaction }) => {
  const { exchangeRates: exchangeRatesData, updateExchangeRates } = useBusiness()
  const [formData, setFormData] = useState({
    vendorName: "",
    customVendorName: "",
    itemPurchased: "",
    customItemName: "",
    transactionDate: "",
    quantity: "",
    priceUSD: "",
    exchangeRate: "",
    priceNGN: "",
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
  const [previousBalance, setPreviousBalance] = useState(0)
  const [balanceInfo, setBalanceInfo] = useState({ status: "paid", color: "green", text: "No Outstanding Balance" })
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Helper function to safely format money
  const safeFormatMoney = (value, decimals = 2) => {
    if (value === "" || value === null || value === undefined) return ""
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value)
    return isNaN(numValue) ? "" : formatMoney(numValue, decimals)
  }

  // Helper function to safely parse numeric value from string
  const safeParseFloat = (value) => {
    if (value === "" || value === null || value === undefined) return 0
    const stringValue = typeof value === 'string' ? value : String(value)
    const parsed = parseFloat(stringValue.replace(/,/g, ''))
    return isNaN(parsed) ? 0 : parsed
  }

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
        quantity: transaction.quantity ? transaction.quantity.toString() : "",
        priceUSD: transaction.priceUSD ? transaction.priceUSD.toString() : "",
        exchangeRate: transaction.exchangeRate ? transaction.exchangeRate.toString() : (exchangeRatesData && exchangeRatesData.buyRate != null ? exchangeRatesData.buyRate.toString() : "1500"),
        priceNGN: transaction.priceNGN ? transaction.priceNGN.toString() : "",
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
        priceUSD: "",
        exchangeRate: exchangeRatesData && exchangeRatesData.buyRate != null ? exchangeRatesData.buyRate.toString() : "1500",
        priceNGN: "",
        otherExpensesUSD: "0",
        otherExpensesNGN: "0",
        paymentStatus: "unpaid",
        amountPaid: "",
      })
    }
    setErrors({})
  }, [transaction, isOpen, exchangeRatesData])

  // Auto-calculate priceNGN when priceUSD and exchangeRate change
  useEffect(() => {
    if (formData.priceUSD && formData.exchangeRate) {
      const usd = safeParseFloat(formData.priceUSD)
      const rate = safeParseFloat(formData.exchangeRate)
      const ngn = usd * rate
      setFormData((prev) => ({ ...prev, priceNGN: ngn > 0 ? ngn.toString() : "" }))
    }
  }, [formData.priceUSD, formData.exchangeRate])

  // Auto-calculate otherExpensesNGN when otherExpensesUSD and exchangeRate change
  useEffect(() => {
    if (formData.otherExpensesUSD && formData.exchangeRate) {
      const usd = safeParseFloat(formData.otherExpensesUSD)
      const rate = safeParseFloat(formData.exchangeRate)
      const ngn = usd * rate
      setFormData((prev) => ({ ...prev, otherExpensesNGN: ngn > 0 ? ngn.toString() : "0" }))
    }
  }, [formData.otherExpensesUSD, formData.exchangeRate])

  // Fetch vendor balance when vendor is selected
  useEffect(() => {
    const fetchVendorBalance = async () => {
      if (formData.vendorName && formData.vendorName !== "Other") {
        setBalanceLoading(true);
        try {
          const response = await getVendorBalanceByName(formData.vendorName);
          const balance = response.data?.outstandingBalance || 0;
          const paymentStatus = response.data?.paymentStatus || "paid";
          setPreviousBalance(balance);
          
          let statusText = "No Outstanding Balance";
          let statusColor = "green";
          
          if (paymentStatus === "partial") {
            statusText = "Partial Payment";
            statusColor = "yellow";
          } else if (paymentStatus === "unpaid") {
            statusText = "Unpaid Balance";
            statusColor = "red";
          } else if (paymentStatus === "paid") {
            statusText = "No Outstanding Balance";
            statusColor = "green";
          }
          
          setBalanceInfo({ 
            status: paymentStatus, 
            color: statusColor, 
            text: statusText 
          });
        } catch (error) {
          console.error("Error fetching vendor balance:", error);
          // Fallback to 0 balance if API fails
          setPreviousBalance(0);
          setBalanceInfo({ status: "paid", color: "green", text: "No Outstanding Balance" });
        } finally {
          setBalanceLoading(false);
        }
      } else {
        setPreviousBalance(0);
        setBalanceInfo({ status: "paid", color: "green", text: "No Outstanding Balance" });
      }
    };

    fetchVendorBalance();
  }, [formData.vendorName]);


  // Calculate totals based on new structure
  const totalNGN = safeParseFloat(formData.priceNGN) + safeParseFloat(formData.otherExpensesNGN)
  const totalUSD = safeParseFloat(formData.priceUSD) + safeParseFloat(formData.otherExpensesUSD)
  
  // Update balance info when transaction amounts change
  useEffect(() => {
    if (formData.priceUSD) {
      const currentTransactionTotal = totalUSD;
      const newBalance = calculateNewBalance(previousBalance, currentTransactionTotal, currentTransactionTotal);
      setBalanceInfo(formatBalanceStatus(newBalance));
    }
  }, [formData.priceUSD, previousBalance, totalUSD]);

  const validateForm = () => {
    const newErrors = {}

    const finalVendorName = formData.vendorName === "Other" ? formData.customVendorName : formData.vendorName
    const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

    if (!finalVendorName.trim()) newErrors.vendorName = "Vendor name is required"
    if (!finalItemName.trim()) newErrors.itemPurchased = "Item type is required"
    if (!formData.transactionDate) newErrors.transactionDate = "Transaction date is required"
    if (!formData.quantity || safeParseFloat(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required"
    if (!formData.priceUSD || safeParseFloat(formData.priceUSD) <= 0)
      newErrors.priceUSD = "Valid price in USD is required"
    if (!formData.exchangeRate || safeParseFloat(formData.exchangeRate) <= 0)
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
          setCategories((prev) => [...prev, newCategory.data])
        } catch (error) {
          console.error('Error creating category:', error)
        }
      }
      // Update exchange rate if it's different from the default buy rate
      const newExchangeRate = safeParseFloat(formData.exchangeRate)
      if (newExchangeRate !== exchangeRatesData.buyRate) {
        try {
          await updateExchangeRate({
            buyRate: newExchangeRate,
            sellRate: exchangeRatesData.sellRate
          })
          updateExchangeRates({
            buyRate: newExchangeRate,
            sellRate: exchangeRatesData.sellRate
          })
        } catch (error) {
          console.error('Error updating exchange rate:', error)
        }
      }
      const amountPaidValue = safeParseFloat(formData.amountPaid) || totalUSD
      const transactionData = {
        itemPurchased: finalItemName,
        transactionDate: formData.transactionDate,
        quantity: safeParseFloat(formData.quantity),
        priceUSD: safeParseFloat(formData.priceUSD),
        exchangeRate: safeParseFloat(formData.exchangeRate),
        priceNGN: safeParseFloat(formData.priceNGN),
        otherExpensesUSD: safeParseFloat(formData.otherExpensesUSD),
        otherExpensesNGN: safeParseFloat(formData.otherExpensesNGN),
        paymentStatus: formData.paymentStatus,
        totalNGN: totalNGN,
        totalUSD: totalUSD,
        amountPaid: amountPaidValue,
      }
      onSave && onSave({ ...transactionData, vendorName, vendorId, isEdit: !!transaction, transactionId: transaction?.id })
      onClose && onClose()
    } catch (err) {
      setApiError(err.message || "Failed to create transaction.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // For money fields, allow raw input but validate format
    if (['priceUSD', 'priceNGN', 'exchangeRate', 'otherExpensesUSD', 'otherExpensesNGN', 'amountPaid'].includes(name)) {
      // Allow empty string, numbers, and one decimal point
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }))
        
        // Clear any previous errors for this field
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }))
        }
      }
      return
    }
    
    // For non-money fields, update normally
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear any previous errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleChange = (field, value) => {
    // If changing quantity and item is Dollar, update priceUSD as well
    if (field === 'quantity' && formData.itemPurchased === 'Dollar') {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        priceUSD: value // Set priceUSD to the same value as quantity for Dollar items
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
          </div>
        </DialogHeader>
        {formData.vendorName && formData.vendorName !== "Other" && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Vendor Balance Information</h3>
            {balanceLoading ? (
              <div className="text-sm text-blue-700">Loading balance information...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Previous Balance:</span>
                  <p className="font-mono font-medium text-blue-900">${formatMoney(previousBalance, 2)}</p>
                </div>
                <div>
                  <span className="text-blue-700">Current Transaction:</span>
                  <p className="font-mono font-medium text-blue-900">${formatMoney(totalUSD, 2)}</p>
                </div>
              </div>
            )}
          </div>
        )}
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
                {formData.itemPurchased === "Dollar" ? 'Amount (USD) *' : 'Quantity *'}
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
              <Label htmlFor="priceUSD" className="text-sm font-medium text-gray-700">
                Price (USD) *
              </Label>
              <div className="relative">
                <Input
                  id="priceUSD"
                  name="priceUSD"
                  value={formData.priceUSD || ""}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`pr-8 ${errors.priceUSD ? "border-red-500" : ""}`}
                />
                <span className="absolute right-2 top-2 text-gray-500">$</span>
              </div>
              {errors.priceUSD && <p className="mt-1 text-sm text-red-600">{errors.priceUSD}</p>}
            </div>

            <div>
              <Label htmlFor="exchangeRate" className="text-sm font-medium text-gray-700">
                Exchange Rate (USD to NGN) *
              </Label>
              <div className="relative">
                <Input
                  id="exchangeRate"
                  name="exchangeRate"
                  value={formData.exchangeRate || ""}
                  onChange={handleInputChange}
                  placeholder="1500"
                  className={errors.exchangeRate ? "border-red-500" : ""}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default buy rate: ₦{exchangeRatesData && exchangeRatesData.buyRate != null ? exchangeRatesData.buyRate.toLocaleString() : "1,650"}. 
                Changing this will update the default rate.
              </p>
              {errors.exchangeRate && <p className="mt-1 text-sm text-red-600">{errors.exchangeRate}</p>}
            </div>

            <div>
              <Label htmlFor="priceNGN" className="text-sm font-medium text-gray-700">
                Price (NGN)
              </Label>
              <div className="relative">
                <Input
                  id="priceNGN"
                  name="priceNGN"
                  value={safeFormatMoney(formData.priceNGN, 2)}
                  readOnly
                  placeholder="0.00"
                  className="bg-gray-100 pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">₦</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from USD price</p>
            </div>

            <div>
              <Label htmlFor="amountPaid" className="text-sm font-medium text-gray-700">
                Amount Paid (USD)
              </Label>
              <div className="relative">
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid || ""}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">$</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave blank to mark as fully paid</p>
            </div>

            <div>
              <Label htmlFor="otherExpensesUSD" className="text-sm font-medium text-gray-700">
                Other Expenses (USD)
              </Label>
              <div className="relative">
                <Input
                  id="otherExpensesUSD"
                  name="otherExpensesUSD"
                  value={formData.otherExpensesUSD || ""}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">$</span>
              </div>
            </div>

            <div>
              <Label htmlFor="otherExpensesNGN" className="text-sm font-medium text-gray-700">
                Other Expenses (NGN)
              </Label>
              <div className="relative">
                <Input
                  id="otherExpensesNGN"
                  name="otherExpensesNGN"
                  value={safeFormatMoney(formData.otherExpensesNGN, 2)}
                  readOnly
                  placeholder="0.00"
                  className="bg-gray-100 pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">₦</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from USD expenses</p>
            </div>

            {/* Calculated Values */}
            <div className="bg-gray-50 p-4 rounded-lg col-span-full">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Price (NGN):</span>
                  <p className="font-mono font-medium">₦{safeFormatMoney(formData.priceNGN, 2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total (NGN):</span>
                  <p className="font-mono font-medium">₦{safeFormatMoney(totalNGN, 2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total (USD):</span>
                  <p className="font-mono font-medium">${safeFormatMoney(totalUSD, 2)}</p>
                </div>
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

export default VendorTransactionModal