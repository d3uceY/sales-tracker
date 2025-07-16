"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import {
  getCustomerPreviousBalance,
  calculateNewBalance,
  formatBalanceStatus,
} from "../../helpers/balance/balance-calculator"
import { useCustomerData } from "../../context/CustomerContext"
import { useItemCategories } from "../../context/ItemCategoryContext"

export function CustomerTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const { customers, addCustomer, fetchCustomers } = useCustomerData();
  const { categories, addCategory } = useItemCategories();
  const [formData, setFormData] = useState({
    customerName: "",
    customCustomerName: "",
    itemPurchased: "",
    customItemName: "",
    transactionDate: "",
    quantity: "",
    amountNGN: "",
    exchangeRate: "1650",
    otherExpensesUSD: "0",
    otherExpensesNGN: "0",
    paymentStatus: "unpaid",
    amountPaid: "",
  })
  const [errors, setErrors] = useState({})

  const [previousBalance, setPreviousBalance] = useState(0)
  const [balanceInfo, setBalanceInfo] = useState({ status: "paid", color: "green", text: "No Outstanding Balance" })

  const amountUSD = (Number.parseFloat(formData.amountNGN) || 0) / (Number.parseFloat(formData.exchangeRate) || 1)
  const totalNGN = (Number.parseFloat(formData.amountNGN) || 0) + (Number.parseFloat(formData.otherExpensesNGN) || 0)
  const totalUSD = amountUSD + (Number.parseFloat(formData.otherExpensesUSD) || 0)

  useEffect(() => {
    if (transaction) {
      setFormData({
        customerName: transaction.customerName === "Other" ? "Other" : transaction.customerName,
        customCustomerName: transaction.customerName === "Other" ? "" : transaction.customerName,
        itemPurchased: transaction.itemPurchased === "Other" ? "Other" : transaction.itemPurchased,
        customItemName: transaction.itemPurchased === "Other" ? "" : transaction.itemPurchased,
        transactionDate: transaction.transactionDate,
        quantity: transaction.quantity.toString(),
        amountNGN: transaction.amountNGN.toString(),
        exchangeRate: transaction.exchangeRate.toString(),
        otherExpensesUSD: transaction.otherExpensesUSD.toString(),
        otherExpensesNGN: transaction.otherExpensesNGN.toString(),
        paymentStatus: transaction.paymentStatus,
        amountPaid: transaction.amountPaid ? transaction.amountPaid.toString() : "",
      })
    } else {
      setFormData({
        customerName: "",
        customCustomerName: "",
        itemPurchased: "",
        customItemName: "",
        transactionDate: new Date().toISOString().split("T")[0],
        quantity: "",
        amountNGN: "",
        exchangeRate: "1650",
        otherExpensesUSD: "0",
        otherExpensesNGN: "0",
        paymentStatus: "unpaid",
        amountPaid: "",
      })
    }
    setErrors({})
  }, [transaction, isOpen])

  useEffect(() => {
    if (formData.customerName && formData.customerName !== "Other") {
      // In a real app, you'd fetch this from your transactions context or API
      const prevBalance = getCustomerPreviousBalance(formData.customerName, [])
      setPreviousBalance(prevBalance)
      setBalanceInfo(formatBalanceStatus(prevBalance))
    } else {
      setPreviousBalance(0)
      setBalanceInfo({ status: "paid", color: "green", text: "No Outstanding Balance" })
    }
  }, [formData.customerName])

  useEffect(() => {
    // Recalculate balance info when amounts change
    if (formData.amountNGN && formData.exchangeRate) {
      const currentTransactionTotal = totalUSD
      const newBalance = calculateNewBalance(previousBalance, currentTransactionTotal, currentTransactionTotal)
      setBalanceInfo(formatBalanceStatus(newBalance))
    }
  }, [formData.amountNGN, formData.exchangeRate, previousBalance])

  // Add effect to auto-convert otherExpensesUSD to NGN
  useEffect(() => {
    // Only auto-calculate if user hasn't manually changed NGN field
    if (formData.otherExpensesUSD && formData.exchangeRate) {
      const usd = parseFloat(formData.otherExpensesUSD) || 0;
      const rate = parseFloat(formData.exchangeRate) || 1;
      const ngn = usd * rate;
      setFormData((prev) => ({ ...prev, otherExpensesNGN: ngn ? ngn.toFixed(2) : "0" }));
    }
    // eslint-disable-next-line
  }, [formData.otherExpensesUSD, formData.exchangeRate]);

  const validateForm = () => {
    const newErrors = {}

    const finalCustomerName = formData.customerName === "Other" ? formData.customCustomerName : formData.customerName
    const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

    if (!finalCustomerName.trim()) newErrors.customerName = "Customer name is required"
    if (!finalItemName.trim()) newErrors.itemPurchased = "Item type is required"
    if (!formData.transactionDate) newErrors.transactionDate = "Transaction date is required"
    if (!formData.quantity || Number.parseFloat(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required"
    if (!formData.amountNGN || Number.parseFloat(formData.amountNGN) <= 0)
      newErrors.amountNGN = "Valid amount is required"
    if (!formData.exchangeRate || Number.parseFloat(formData.exchangeRate) <= 0)
      newErrors.exchangeRate = "Valid exchange rate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      let finalCustomerName = formData.customerName === "Other" ? formData.customCustomerName : formData.customerName
      let customerId = null;
      if (formData.customerName === "Other") {
        // Create the customer first
        const newCustomer = await addCustomer({ name: formData.customCustomerName })
        finalCustomerName = newCustomer.name
        customerId = newCustomer.id
        await fetchCustomers(); // Refresh list for next time
      } else {
        // Find the selected customer in the list
        const selected = (customers || []).find(c => c.name === formData.customerName)
        customerId = selected ? selected.id : null
      }
      let finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased
      if (formData.itemPurchased === "Other" && formData.customItemName) {
        // Add the new item to categories
        addCategory({ name: formData.customItemName, description: "User added", active: true })
      }
      const amountPaidValue = Number.parseFloat(formData.amountPaid) || totalUSD
      const newOutstandingBalance = calculateNewBalance(previousBalance, totalUSD, amountPaidValue)
      const transactionData = {
        customerName: finalCustomerName,
        customerId,
        itemPurchased: finalItemName,
        transactionDate: formData.transactionDate,
        quantity: Number.parseFloat(formData.quantity),
        amountNGN: Number.parseFloat(formData.amountNGN),
        exchangeRate: Number.parseFloat(formData.exchangeRate),
        amountUSD: amountUSD,
        otherExpensesUSD: Number.parseFloat(formData.otherExpensesUSD) || 0,
        otherExpensesNGN: Number.parseFloat(formData.otherExpensesNGN) || 0,
        paymentStatus: newOutstandingBalance > 0 ? "unpaid" : "paid",
        totalNGN: totalNGN,
        totalUSD: totalUSD,
        amountPaid: amountPaidValue,
        previousBalance: previousBalance,
        outstandingBalance: newOutstandingBalance,
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

  const customerOptions = (customers || []).map(c => c.name).concat("Other");
  // Only add 'Other' if it is not already present in the categories
  const itemOptionsBase = (categories || []).filter(c => c.active).map(c => c.name);
  const itemOptions = itemOptionsBase.includes("Other") ? itemOptionsBase : [...itemOptionsBase, "Other"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {transaction ? "Edit Customer Sale" : "Create Customer Sale"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {formData.customerName && formData.customerName !== "Other" && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Customer Balance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Previous Balance:</span>
                <p className="font-mono font-medium text-blue-900">${previousBalance.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-blue-700">Current Transaction:</span>
                <p className="font-mono font-medium text-blue-900">${totalUSD.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-blue-700">Status:</span>
                <p
                  className={`font-medium ${
                    balanceInfo.color === "green"
                      ? "text-green-600"
                      : balanceInfo.color === "red"
                        ? "text-red-600"
                        : "text-blue-600"
                  }`}
                >
                  {balanceInfo.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                Customer Name *
              </Label>
              <Select value={formData.customerName} onValueChange={(value) => handleChange("customerName", value)}>
                <SelectTrigger className={`mt-1 ${errors.customerName ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.customerName === "Other" && (
                <Input
                  placeholder="Enter customer name"
                  value={formData.customCustomerName}
                  onChange={(e) => handleChange("customCustomerName", e.target.value)}
                  className="mt-2"
                />
              )}
              {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
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
                  {itemOptions.map((item) => (
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
              <Label htmlFor="amountNGN" className="text-sm font-medium text-gray-700">
                Amount (NGN) *
              </Label>
              <Input
                id="amountNGN"
                type="number"
                step="0.01"
                value={formData.amountNGN}
                onChange={(e) => handleChange("amountNGN", e.target.value)}
                placeholder="0.00"
                className={`mt-1 ${errors.amountNGN ? "border-red-500" : ""}`}
              />
              {errors.amountNGN && <p className="mt-1 text-sm text-red-600">{errors.amountNGN}</p>}
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
                <span className="text-gray-600">Amount (USD):</span>
                <p className="font-mono font-medium">${amountUSD.toFixed(2)}</p>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {transaction ? "Update Sale" : "Create Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
