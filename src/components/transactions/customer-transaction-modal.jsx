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
import { formatMoney, parseMoney } from "../../utils/formatters"
import { useCustomerData } from "../../context/CustomerContext"
import { getItemCategories, createItemCategory } from "../../helpers/api/item-categories"
import { getCustomerBalanceByName } from "../../helpers/api/customers"
import { useBusiness } from "../../context/BusinessContext"
import { updateExchangeRate } from "../../helpers/api/exchange-rate"

export function CustomerTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const { customers, addCustomer, fetchCustomers, loading } = useCustomerData();
  const { exchangeRates: exchangeRatesData, updateExchangeRates } = useBusiness();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    customCustomerName: "",
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [previousBalance, setPreviousBalance] = useState(0)
  const [balanceInfo, setBalanceInfo] = useState({ status: "paid", color: "green", text: "No Outstanding Balance" })
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Calculate totals based on new structure
  const totalNGN = (Number.parseFloat(formData.priceNGN) || 0) + (Number.parseFloat(formData.otherExpensesNGN) || 0)
  const totalUSD = (Number.parseFloat(formData.priceUSD) || 0) + (Number.parseFloat(formData.otherExpensesUSD) || 0)

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      // Fetch categories
      setLoadingCategories(true);
      getItemCategories()
        .then((res) => {
          setCategories(res.data || []);
        })
        .catch(() => setCategories([]))
        .finally(() => setLoadingCategories(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        customerId: transaction.customerId || "",
        customCustomerName: "",
        itemPurchased: transaction.itemPurchased || "",
        customItemName: "",
        transactionDate: transaction.transactionDate || new Date().toISOString().split("T")[0],
        quantity: transaction.quantity?.toString() || "",
        priceNGN: transaction.priceNGN?.toString() || "",
        exchangeRate: transaction.exchangeRate?.toString() || exchangeRatesData?.sellRate?.toString() || "1500",
        priceUSD: transaction.priceUSD?.toString() || "",
        otherExpensesUSD: transaction.otherExpensesUSD?.toString() || "0",
        otherExpensesNGN: transaction.otherExpensesNGN?.toString() || "0",
        paymentStatus: transaction.paymentStatus || "unpaid",
        amountPaid: transaction.amountPaid?.toString() || "",
      })
    } else {
      setFormData({
        customerId: "",
        customCustomerName: "",
        itemPurchased: "",
        customItemName: "",
        transactionDate: new Date().toISOString().split("T")[0],
        quantity: "",
        priceNGN: "",
        exchangeRate: exchangeRatesData?.sellRate?.toString() || "1500",
        priceUSD: "",
        otherExpensesUSD: "0",
        otherExpensesNGN: "0",
        paymentStatus: "unpaid",
        amountPaid: "",
      })
    }
    setErrors({})
  }, [transaction, isOpen, customers, exchangeRatesData?.sellRate])

  // Fetch customer balance when customer is selected
  useEffect(() => {
    const fetchCustomerBalance = async () => {
      if (formData.customerId && formData.customerId !== "Other") {
        setBalanceLoading(true);
        try {
          const selected = (customers || []).find(c => c.id === formData.customerId);
          if (selected) {
            const response = await getCustomerBalanceByName(selected.name);
            const balance = response.data?.outstandingBalance || 0;
            const paymentStatus = response.data?.paymentStatus || "paid";
            setPreviousBalance(balance);
            
            // Use the payment status from API response
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
          }
        } catch (error) {
          console.error("Error fetching customer balance:", error);
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

    fetchCustomerBalance();
  }, [formData.customerId, customers]);

  useEffect(() => {
    // Recalculate balance info when amounts change
    if (formData.priceUSD) {
      const currentTransactionTotal = totalUSD
      const newBalance = calculateNewBalance(previousBalance, currentTransactionTotal, currentTransactionTotal)
      setBalanceInfo(formatBalanceStatus(newBalance))
    }
  }, [formData.priceUSD, previousBalance, totalUSD])

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

  const validateForm = () => {
    const newErrors = {}

    const finalCustomerName = formData.customerId === "Other" ? formData.customCustomerName : formData.customerId;
    const finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased

    if (!finalCustomerName.trim()) newErrors.customerId = "Customer name is required"
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
    e.preventDefault();
    setSubmitError("");
    if (validateForm()) {
      setSubmitLoading(true);
      try {
        let customerId = formData.customerId;
        let finalCustomerName = "";
        // If "Other", create the customer first
        if (formData.customerId === "Other") {
          try {
            const res = await addCustomer({ name: formData.customCustomerName });
            customerId = res?.data?.id;
            finalCustomerName = res?.data?.name;
            if (!customerId) {
              setSubmitError("Failed to get new customer ID. Please try again.");
              setSubmitLoading(false);
              return;
            }
            await fetchCustomers();
            setFormData((prev) => ({ ...prev, customerId, customCustomerName: "" }));
          } catch (err) {
            setSubmitError("Failed to create customer. Please try again.");
            setSubmitLoading(false);
            return;
          }
        } else {
          const selected = (customers || []).find(c => c.id === formData.customerId);
          finalCustomerName = selected ? selected.name : "";
          if (!customerId) {
            setSubmitError("Could not find the selected customer. Please try again.");
            setSubmitLoading(false);
            return;
          }
        }
        let finalItemName = formData.itemPurchased === "Other" ? formData.customItemName : formData.itemPurchased;
        if (formData.itemPurchased === "Other" && formData.customItemName) {
          try {
            const newCategory = await createItemCategory({ 
              name: formData.customItemName, 
              description: "User added from customer transaction",
              active: true 
            });
            // Refresh categories list
            setCategories((prev) => [...prev, newCategory.data]);
          } catch (error) {
            console.error('Error creating category:', error);
            // Continue with the transaction even if category creation fails
          }
        }
        
        // Update exchange rate if it's different from the default sell rate
        const newExchangeRate = Number.parseFloat(formData.exchangeRate)
        if (newExchangeRate !== exchangeRatesData.sellRate) {
          try {
            await updateExchangeRate({
              buyRate: exchangeRatesData.buyRate,
              sellRate: newExchangeRate
            })
            // Update the context with new rates
            updateExchangeRates({
              buyRate: exchangeRatesData.buyRate,
              sellRate: newExchangeRate
            })
          } catch (error) {
            console.error('Error updating exchange rate:', error)
            // Continue with the transaction even if rate update fails
          }
        }
        
        const amountPaidValue = Number.parseFloat(formData.amountPaid) || 0;
        const newOutstandingBalance = calculateNewBalance(previousBalance, totalUSD, amountPaidValue);
        const transactionData = {
          itemPurchased: finalItemName,
          transactionDate: formData.transactionDate,
          quantity: Number.parseFloat(formData.quantity),
          priceNGN: Number.parseFloat(formData.priceNGN),
          exchangeRate: Number.parseFloat(formData.exchangeRate),
          priceUSD: Number.parseFloat(formData.priceUSD),
          otherExpensesUSD: Number.parseFloat(formData.otherExpensesUSD) || 0,
          otherExpensesNGN: Number.parseFloat(formData.otherExpensesNGN) || 0,
          paymentStatus: amountPaidValue >= totalUSD ? "paid" : amountPaidValue > 0 ? "partial" : "unpaid",
          totalNGN: totalNGN,
          totalUSD: totalUSD,
          amountPaid: amountPaidValue + (Number(previousBalance) || 0),
          previousBalance: previousBalance,
          outstandingBalance: newOutstandingBalance,
        };
        await onSave({ customerId, transactionData });
        setSubmitLoading(false);
      } catch (err) {
        setSubmitError("An error occurred while saving the transaction. Please try again.");
        setSubmitLoading(false);
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Format money fields with commas as user types
    if (['priceNGN', 'exchangeRate', 'priceUSD', 'otherExpensesUSD', 'otherExpensesNGN', 'amountPaid'].includes(name)) {
      const numericValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except decimal point
      const parts = numericValue.split('.');
      
      // Only allow numbers with up to 2 decimal places
      if (parts.length > 1 && parts[1].length > 2) {
        return; // Don't update if more than 2 decimal places
      }
      
      // Parse the numeric value to remove any extra decimal points
      const parsedValue = parseFloat(numericValue) || 0;
      
      // Update the form data with the parsed value
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      
      // Also update the calculated fields if needed
      if (name === 'priceNGN' || name === 'exchangeRate') {
        if (formData.priceNGN && formData.exchangeRate) {
          const ngn = name === 'priceNGN' ? parsedValue : parseFloat(formData.priceNGN) || 0;
          const rate = name === 'exchangeRate' ? parsedValue : parseFloat(formData.exchangeRate) || 1;
          const usd = ngn / rate;
          setFormData(prev => ({
            ...prev,
            priceUSD: isNaN(usd) ? '' : usd.toFixed(2)
          }));
        }
      } else if (name === 'otherExpensesUSD') {
        const usd = parsedValue || 0;
        const rate = parseFloat(formData.exchangeRate) || 1;
        const ngn = usd * rate;
        setFormData(prev => ({
          ...prev,
          otherExpensesNGN: isNaN(ngn) ? '0' : ngn.toFixed(2)
        }));
      }
      
      return;
    }
    
    // For non-money fields, update normally
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const customerOptions = (customers || []).map(c => ({ id: c.id, name: c.name })).concat({ id: "Other", name: "Other" });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {transaction ? "Edit Customer Sale" : "Create Customer Sale"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {formData.customerId && formData.customerId !== "Other" && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Customer Balance Information</h3>
            {balanceLoading ? (
              <div className="text-sm text-blue-700">Loading balance information...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Previous Balance:</span>
                  <p className="font-mono font-medium text-blue-900">{formatMoney(previousBalance, 2)}</p>
                </div>
                <div>
                  <span className="text-blue-700">Current Transaction:</span>
                  <p className="font-mono font-medium text-blue-900">{formatMoney(totalUSD, 2)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerId" className="text-sm font-medium text-gray-700">
                Customer Name *
              </Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))} disabled={loading || customers.length === 0}>
                <SelectTrigger className={`mt-1 ${errors.customerId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={loading ? "Loading customers..." : "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.customerId === "Other" && (
                <Input
                  placeholder="Enter customer name"
                  value={formData.customCustomerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customCustomerName: e.target.value }))}
                  className="mt-2"
                />
              )}
              {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
            </div>

            <div>
              <Label htmlFor="itemPurchased" className="text-sm font-medium text-gray-700">
                Item Purchased *
              </Label>
              <Select value={formData.itemPurchased} onValueChange={(value) => setFormData((prev) => ({ ...prev, itemPurchased: value }))}>
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, customItemName: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, transactionDate: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder={formData.itemPurchased === "Dollar" ? "Amount in USD" : "Number of units"}
                className={`mt-1 ${errors.quantity ? "border-red-500" : ""}`}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              <Label htmlFor="priceNGN" className="text-sm font-medium text-gray-700">
                Price (NGN) *
              </Label>
              <div className="relative">
                <Input
                  id="priceNGN"
                  name="priceNGN"
                  type="text"
                  value={formData.priceNGN}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const num = parseMoney(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      priceNGN: isNaN(num) ? '' : num.toString()
                    }));
                  }}
                  placeholder="0.00"
                  className={`pr-8 ${errors.priceNGN ? "border-red-500" : ""}`}
                />
                <span className="absolute right-2 top-2 text-gray-500">₦</span>
              </div>
              {errors.priceNGN && <p className="mt-1 text-sm text-red-600">{errors.priceNGN}</p>}
            </div>

            <div>
              <Label htmlFor="exchangeRate" className="text-sm font-medium text-gray-700">
                Exchange Rate (USD to NGN) *
              </Label>
              <div className="relative">
                <Input
                  id="exchangeRate"
                  name="exchangeRate"
                  type="text"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const num = parseMoney(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      exchangeRate: isNaN(num) ? '' : num.toString()
                    }));
                  }}
                  placeholder="1500"
                  className={errors.exchangeRate ? "border-red-500" : ""}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default sell rate: ₦{exchangeRatesData && exchangeRatesData.sellRate != null ? exchangeRatesData.sellRate.toLocaleString() : "1,655"}. 
                Changing this will update the default rate.
              </p>
              {errors.exchangeRate && <p className="mt-1 text-sm text-red-600">{errors.exchangeRate}</p>}
            </div>

            <div>
              <Label htmlFor="priceUSD" className="text-sm font-medium text-gray-700">
                Price (USD)
              </Label>
              <div className="relative">
                <Input
                  id="priceUSD"
                  name="priceUSD"
                  type="text"
                  value={formatMoney(formData.priceUSD || 0, 2)}
                  readOnly
                  placeholder="0.00"
                  className="bg-gray-100"
                />
                <span className="absolute right-2 top-2 text-gray-500">$</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from NGN price</p>
            </div>

            <div>
              <Label htmlFor="amountPaid" className="text-sm font-medium text-gray-700">
                Amount Paid (NGN)
              </Label>
              <div className="relative">
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="text"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const num = parseMoney(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      amountPaid: isNaN(num) ? '' : num.toString()
                    }));
                  }}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">₦</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the amount paid by customer in Naira</p>
              {/* Total Paid Including Previous Balance */}
              <div className="mt-1 text-xs text-blue-700">
                Total Paid (Including Previous Balance): <span className="font-mono font-semibold text-blue-900">₦{formatMoney((Number(formData.amountPaid) || 0) + (Number(previousBalance) || 0), 2)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="otherExpensesUSD" className="text-sm font-medium text-gray-700">
                Other Expenses (USD)
              </Label>
              <div className="relative">
                <Input
                  id="otherExpensesUSD"
                  name="otherExpensesUSD"
                  type="text"
                  value={formData.otherExpensesUSD}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const num = parseMoney(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      otherExpensesUSD: isNaN(num) ? '0' : num.toString()
                    }));
                  }}
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
                  type="text"
                  value={formatMoney(formData.otherExpensesNGN || 0, 2)}
                  readOnly
                  placeholder="0.00"
                  className="bg-gray-100 pr-8"
                />
                <span className="absolute right-2 top-2 text-gray-500">₦</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
                Payment Status
              </Label>
              <Select value={formData.paymentStatus} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentStatus: value }))}>
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
            {submitError && <p className="text-red-600 text-sm flex-1 self-center">{submitError}</p>}
            <Button type="button" variant="outline" onClick={onClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitLoading}>
              {submitLoading ? "Processing..." : (transaction ? "Update Sale" : "Create Sale")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
