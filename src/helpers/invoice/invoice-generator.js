// Invoice generation utility functions

export const generateInvoiceHTML = (transactionData, businessInfo = {}) => {
    const {
      customerName,
      vendorName,
      itemPurchased,
      transactionDate,
      quantity,
      amountUSD,
      amountNGN,
      exchangeRate,
      otherExpensesUSD,
      otherExpensesNGN,
      totalUSD,
      totalNGN,
      paymentStatus,
      outstandingBalance = 0,
      invoiceNumber = `INV-${Date.now()}`,
    } = transactionData
  
    const isCustomer = !!customerName
    const clientName = customerName || vendorName
    const invoiceType = isCustomer ? "SALES INVOICE" : "PURCHASE INVOICE"
  
    const business = {
      name: businessInfo.name || "Your Business Name",
      address: businessInfo.address || "123 Business Street, Lagos, Nigeria",
      phone: businessInfo.phone || "+234 123 456 7890",
      email: businessInfo.email || "info@yourbusiness.com",
      ...businessInfo,
    }
  
    // Defensive: ensure all numbers are defined and valid
    const safeNumber = (val) => (typeof val === 'number' && !isNaN(val) ? val : 0)
    const safeString = (val) => (val !== undefined && val !== null ? val : "")
    const safeLocale = (val) => safeNumber(val).toLocaleString()
  
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333;
            line-height: 1.6;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 30px; 
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
          }
          .business-info h1 { 
            color: #2563eb; 
            margin: 0 0 10px 0; 
            font-size: 28px;
          }
          .business-info p { 
            margin: 5px 0; 
            color: #666;
          }
          .invoice-details { 
            text-align: right; 
          }
          .invoice-details h2 { 
            color: #dc2626; 
            margin: 0 0 10px 0; 
            font-size: 24px;
          }
          .invoice-details p { 
            margin: 5px 0; 
            font-weight: bold;
          }
          .client-info { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
          }
          .client-info h3 { 
            margin: 0 0 15px 0; 
            color: #374151;
            font-size: 18px;
          }
          .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .invoice-table th { 
            background: #374151; 
            color: white; 
            padding: 15px; 
            text-align: left; 
            font-weight: bold;
          }
          .invoice-table td { 
            padding: 15px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .invoice-table tr:nth-child(even) { 
            background: #f9fafb; 
          }
          .text-right { 
            text-align: right; 
          }
          .text-center { 
            text-align: center; 
          }
          .totals-section { 
            max-width: 400px; 
            margin-left: auto; 
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 8px 0;
          }
          .total-row.final { 
            border-top: 2px solid #374151; 
            font-weight: bold; 
            font-size: 18px;
            color: #dc2626;
          }
          .payment-status { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center;
            font-weight: bold;
          }
          .status-paid { 
            background: #dcfce7; 
            color: #166534; 
            border: 1px solid #bbf7d0;
          }
          .status-unpaid { 
            background: #fef2f2; 
            color: #dc2626; 
            border: 1px solid #fecaca;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .invoice-header { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="business-info">
            <h1>${business.name}</h1>
            <p>${business.address}</p>
            <p>Phone: ${business.phone}</p>
            <p>Email: ${business.email}</p>
          </div>
          <div class="invoice-details">
            <h2>${invoiceType}</h2>
            <p>Invoice #: ${invoiceNumber}</p>
            <p>Date: ${new Date(transactionDate).toLocaleDateString()}</p>
            <p>Due Date: ${new Date(new Date(transactionDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>
        </div>
  
        <div class="client-info">
          <h3>${isCustomer ? "Bill To:" : "Vendor:"}</h3>
          <p><strong>${clientName}</strong></p>
          <p>Transaction Date: ${new Date(transactionDate).toLocaleDateString()}</p>
        </div>
  
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Rate (USD)</th>
              <th class="text-right">Exchange Rate</th>
              <th class="text-right">Amount (USD)</th>
              <th class="text-right">Amount (NGN)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${itemPurchased}</strong></td>
              <td class="text-center">${itemPurchased === "Dollar" ? `$${safeLocale(quantity)}` : safeString(quantity)}</td>
              <td class="text-right">$${(safeNumber(amountUSD) / safeNumber(quantity)).toFixed(2)}</td>
              <td class="text-right">₦${safeLocale(exchangeRate)}</td>
              <td class="text-right">$${safeLocale(amountUSD)}</td>
              <td class="text-right">₦${safeLocale(amountNGN)}</td>
            </tr>
            ${
              otherExpensesUSD > 0
                ? `
            <tr>
              <td><strong>Other Expenses</strong></td>
              <td class="text-center">1</td>
              <td class="text-right">$${safeNumber(otherExpensesUSD).toFixed(2)}</td>
              <td class="text-right">₦${safeLocale(exchangeRate)}</td>
              <td class="text-right">$${safeNumber(otherExpensesUSD).toFixed(2)}</td>
              <td class="text-right">₦${safeLocale(otherExpensesNGN)}</td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>
  
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal (USD):</span>
            <span>$${safeLocale(totalUSD)}</span>
          </div>
          <div class="total-row">
            <span>Subtotal (NGN):</span>
            <span>₦${safeLocale(totalNGN)}</span>
          </div>
          ${
            outstandingBalance > 0
              ? `
          <div class="total-row">
            <span>Previous Balance:</span>
            <span>$${safeLocale(outstandingBalance)}</span>
          </div>
          <div class="total-row final">
            <span>Total Due:</span>
            <span>$${safeLocale(totalUSD + safeNumber(outstandingBalance))}</span>
          </div>
          `
              : `
          <div class="total-row final">
            <span>Total:</span>
            <span>$${safeLocale(totalUSD)}</span>
          </div>
          `
          }
        </div>
  
        <div class="payment-status ${paymentStatus === "paid" ? "status-paid" : "status-unpaid"}">
          Payment Status: ${paymentStatus.toUpperCase()}
          ${
            outstandingBalance > 0 && paymentStatus === "unpaid"
              ? `<br>Outstanding Balance: $${safeLocale(outstandingBalance)}`
              : ""
          }
        </div>
  
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This invoice was generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `
  }
  
  export const downloadInvoicePDF = (transactionData, businessInfo) => {
    const htmlContent = generateInvoiceHTML(transactionData, businessInfo)
  
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      // Close window after printing (optional)
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }
  }
  
  export const previewInvoice = (transactionData, businessInfo) => {
    const htmlContent = generateInvoiceHTML(transactionData, businessInfo)
  
    // Open in new tab for preview
    const previewWindow = window.open("", "_blank")
    previewWindow.document.write(htmlContent)
    previewWindow.document.close()
  }
  