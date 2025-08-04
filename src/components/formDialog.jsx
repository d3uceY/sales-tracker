import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { postTransaction } from '../helpers/api/transaction';

const formSchema = z.object({
  item: z.string().min(1, "Item description is required"),
  customer: z.string().min(1, "Customer is required"),
  newCustomerName: z.string().optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
  priceNGN: z.number().min(0.01, "Price in NGN must be greater than 0"),
  exchangeRate: z.number().min(0.01, "Exchange rate must be greater than 0"),
  priceUSD: z.number().optional(), // Calculated field
  otherExpensesUSD: z.number().optional().default(0),
  otherExpensesNGN: z.number().optional(), // Calculated field
});



export default function TransactionFormDialog() {
  const [open, setOpen] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const existingCustomers = [
    "John Doe",
    "Jane Smith",
    "Acme Corp",
    "Tech Solutions Ltd",
    "Global Imports Inc"
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      item: "",
      customer: "",
      newCustomerName: "",
      transactionDate: new Date().toISOString().split('T')[0],
      priceNGN: 0,
      exchangeRate: 1500, 
      priceUSD: 0,
      otherExpensesUSD: 0,
      otherExpensesNGN: 0,
    },
  });

  // --- Calculations and Form Logic ---

  const priceNGN = form.watch("priceNGN");
  const otherExpensesUSD = form.watch("otherExpensesUSD");
  const exchangeRate = form.watch("exchangeRate");

  useEffect(() => {
    const priceUSD = (priceNGN || 0) / (exchangeRate || 1);
    form.setValue('priceUSD', Number(priceUSD.toFixed(2)));
  }, [priceNGN, exchangeRate, form.setValue]);

  useEffect(() => {
    const otherExpNGN = (otherExpensesUSD || 0) * (exchangeRate || 0);
    form.setValue('otherExpensesNGN', Number(otherExpNGN.toFixed(2)));
  }, [otherExpensesUSD, exchangeRate, form.setValue]);

  const priceUSD = form.watch("priceUSD", 0);
  const otherExpensesNGN = form.watch("otherExpensesNGN", 0);

  const totalUSD = (priceUSD || 0) + (otherExpensesUSD || 0);
  const totalNGN = (priceNGN || 0) + (otherExpensesNGN || 0);

  const onSubmit = (data) => {
    const payload = {
      itemPurchased: data.item,
      customer: data.customer,
      transactionDate: data.transactionDate,
      priceNGN: data.priceNGN,
      exchangeRate: data.exchangeRate,
      priceUSD: data.priceUSD || 0, 
      otherExpensesUSD: data.otherExpensesUSD || 0,
      otherExpensesNGN: data.otherExpensesNGN || 0,
      totalUSD: totalUSD,
      totalNGN: totalNGN,
    };

    postTransaction(payload)
    console.log('Final Payload Sent to Backend:', payload);
    alert('Transaction saved successfully! Check the console for the payload.');
    setOpen(false); 
    form.reset(); 
  };

  const handleCustomerChange = (value) => {
    if (value === "new-customer") {
      setShowNewCustomer(true);
      form.setValue("customer", ""); 
    } else {
      setShowNewCustomer(false);
      form.setValue("customer", value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Enter the transaction details below. Currency conversions will be calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Item Description */}
          <div className="space-y-2">
            <Label htmlFor="item">Item Description</Label>
            <Input
              id="item"
              placeholder="Enter item description..."
              {...form.register("item")}
            />
            {form.formState.errors.item && (
              <p className="text-sm text-red-500">{form.formState.errors.item.message}</p>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Controller
              control={form.control}
              name="customer"
              render={({ field }) => (
                <Select onValueChange={handleCustomerChange} value={showNewCustomer ? "new-customer" : field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCustomers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                    <SelectItem value="new-customer">
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Add New Customer
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.customer && (
              <p className="text-sm text-red-500">{form.formState.errors.customer.message}</p>
            )}
          </div>

          {/* New Customer Name Input */}
          {showNewCustomer && (
            <div className="space-y-2">
              <Label htmlFor="newCustomerName">New Customer Name</Label>
              <Input
                id="newCustomerName"
                placeholder="Enter new customer name..."
                {...form.register("newCustomerName")}
                onChange={(e) => {
                  form.setValue("newCustomerName", e.target.value, { shouldValidate: true });
                  form.setValue("customer", e.target.value, { shouldValidate: true });
                }}
              />
              {form.formState.errors.newCustomerName && (
                <p className="text-sm text-red-500">{form.formState.errors.newCustomerName.message}</p>
              )}
            </div>
          )}

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label htmlFor="transactionDate">Transaction Date</Label>
            <Input
              id="transactionDate"
              type="date"
              {...form.register("transactionDate")}
            />
            {form.formState.errors.transactionDate && (
              <p className="text-sm text-red-500">{form.formState.errors.transactionDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price in NGN */}
            <div className="space-y-2">
              <Label htmlFor="priceNGN">Price (NGN)</Label>
              <Input
                id="priceNGN"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("priceNGN", { valueAsNumber: true })}
              />
              {form.formState.errors.priceNGN && (
                <p className="text-sm text-red-500">{form.formState.errors.priceNGN.message}</p>
              )}
            </div>

            {/* Exchange Rate */}
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Exchange Rate (USD to NGN)</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.01"
                placeholder="1500.00"
                {...form.register("exchangeRate", { valueAsNumber: true })}
              />
                              {form.formState.errors.exchangeRate && (
                  <p className="text-sm text-red-500">{form.formState.errors.exchangeRate.message}</p>
                )}
            </div>

            {/* Price in USD (Auto-calculated) */}
            <div className="space-y-2">
              <Label htmlFor="priceUSD" className="text-gray-500">Price (USD)</Label>
              <Input
                id="priceUSD"
                type="text"
                value={`$${(priceUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="bg-gray-100 border-gray-300"
              />
            </div>

            {/* Other Expenses USD */}
            <div className="space-y-2">
              <Label htmlFor="otherExpensesUSD">Other Expenses (USD)</Label>
              <Input
                id="otherExpensesUSD"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("otherExpensesUSD", { valueAsNumber: true })}
              />
            </div>

            {/* Other Expenses NGN (Auto-calculated) */}
            <div className="space-y-2">
                <Label htmlFor="otherExpensesNGN" className="text-gray-500">Other Expenses (NGN)</Label>
                <Input
                    id="otherExpensesNGN"
                    type="text"
                    value={`₦${(otherExpensesNGN || 0).toLocaleString('en-NG')}`}
                    readOnly
                    className="bg-gray-100 border-gray-300"
                />
            </div>

          </div>

          {/* Final Balance Display */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800">Total Amounts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
               <div className="text-center sm:text-left">
                  <p className="text-sm text-blue-600">Total in USD</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
               </div>
               <div className="text-center sm:text-left">
                  <p className="text-sm text-blue-600">Total in NGN</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₦{totalNGN.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
               </div>
            </CardContent>
          </Card>
        </form>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="transaction-form" className="bg-blue-600 hover:bg-blue-700">
                Save Transaction
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
