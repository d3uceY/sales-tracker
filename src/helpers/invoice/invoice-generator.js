// Modern Invoice generation utility functions with improved UI

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
    website: businessInfo.website || "www.yourbusiness.com",
    ...businessInfo,
  }

  // Defensive: ensure all numbers are defined and valid
  const safeNumber = (val) => (typeof val === "number" && !isNaN(val) ? val : 0)
  const safeString = (val) => (val !== undefined && val !== null ? val : "")
  const safeLocale = (val) => safeNumber(val).toLocaleString()

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif; 
          background: #ffffff;
          color: #334155;
          line-height: 1.5;
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .invoice-container {
          max-width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          position: relative;
          padding: 0;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        /* Premium header with sophisticated branding */
        .invoice-header { 
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 40px 50px 30px;
          position: relative;
          overflow: hidden;
        }
        
        .invoice-header::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          transform: rotate(45deg);
        }
        
        .invoice-header::after {
          content: '';
          position: absolute;
          bottom: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }
        
        .header-content {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
        }
        
        /* Montserrat for headings with better hierarchy */
        .business-info h1 { 
          font-family: 'Montserrat', sans-serif;
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .business-details {
          font-size: 14px;
          opacity: 0.95;
          line-height: 1.6;
          font-weight: 400;
        }
        
        .business-details div {
          margin-bottom: 4px;
        }
        
        .invoice-meta { 
          text-align: right;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          min-width: 280px;
        }
        
        .invoice-meta h2 { 
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }
        
        .meta-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          align-items: center;
        }
        
        .meta-label {
          opacity: 0.9;
          font-weight: 500;
        }
        
        .meta-value {
          font-weight: 700;
          margin-left: 20px;
          font-family: 'Montserrat', sans-serif;
        }
        
        /* Enhanced client section with better visual separation */
        .client-section { 
          padding: 40px 50px;
          background: #f8fafc;
          border-bottom: 3px solid #e2e8f0;
        }
        
        .client-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .info-block h3 { 
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2563eb;
          margin-bottom: 12px;
        }
        
        .info-content {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .info-content:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .client-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
        }
        
        .client-date {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }
        
        /* Premium transaction section with enhanced table design */
        .transaction-section {
          padding: 40px 50px;
        }
        
        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 3px solid #2563eb;
          display: inline-block;
          position: relative;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 60px;
          height: 3px;
          background: #0ea5e9;
        }
        
        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .transaction-table th {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 16px;
          text-align: left;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151;
          border-bottom: 2px solid #2563eb;
        }
        
        .transaction-table td {
          padding: 20px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
          transition: background-color 0.2s ease;
        }
        
        .transaction-table tr:hover {
          background: #f8fafc;
        }
        
        .item-name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          font-size: 16px;
        }
        
        .item-details {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
        }
        
        .amount-usd {
          color: #059669;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
        }
        
        .amount-ngn {
          color: #dc2626;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
        }
        
        /* Sophisticated expenses section */
        .expenses-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .expenses-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 16px;
        }
        
        .expenses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .expense-item {
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .expense-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        
        .expense-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        
        .expense-value {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 18px;
        }
        
        /* Premium totals section with enhanced styling */
        .totals-section { 
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          padding: 40px 50px;
          position: relative;
          overflow: hidden;
        }
        
        .totals-section::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(14, 165, 233, 0.1);
          border-radius: 50%;
        }
        
        .totals-content {
          max-width: 400px;
          margin-left: auto;
          position: relative;
          z-index: 2;
        }
        
        .totals-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #0ea5e9;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 12px 0;
          font-size: 16px;
          font-weight: 500;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }
        
        .total-row:hover {
          background: rgba(255, 255, 255, 0.05);
          padding-left: 8px;
          border-radius: 6px;
        }
        
        .total-row:last-child {
          border-bottom: none;
        }
        
        .total-row.subtotal {
          opacity: 0.9;
        }
        
        .total-row.final { 
          margin-top: 16px;
          padding: 20px 16px;
          border-top: 3px solid #0ea5e9;
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: 24px;
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
          border-radius: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        /* Enhanced payment status with better visual feedback */
        .payment-status { 
          margin: 0;
          padding: 24px 50px;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 18px;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .status-paid { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .status-unpaid { 
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .status-partial {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }
        
        /* Professional footer with enhanced styling */
        .footer { 
          background: #f8fafc;
          padding: 40px 50px;
          text-align: center; 
          color: #64748b;
          border-top: 3px solid #e2e8f0;
        }
        
        .footer-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .footer-subtitle {
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .payment-instructions {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-top: 20px;
          text-align: left;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .payment-instructions h4 {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          color: #374151;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .payment-instructions p {
          line-height: 1.6;
          font-size: 14px;
        }
        
        /* Optimized print styles for single page */
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          body { 
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 12px !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .invoice-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Ensure backgrounds and colors print */
          .status-paid,
          .status-unpaid,
          .status-partial,
          .totals-section,
          .payment-status {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Header styles */
          .invoice-header { 
            padding: 15px 20px !important;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .business-info h1 { 
            font-size: 22px !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .business-details {
            color: rgba(255,255,255,0.9) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Transaction section */
          .transaction-section { 
            padding: 15px 20px !important;
          }
          
          .section-title { 
            font-size: 16px !important;
            margin: 15px 0 10px !important;
          }
          
          /* Tables */
          .transaction-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 10px 0 !important;
          }
          
          .transaction-table th,
          .transaction-table td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px 10px !important;
          }
          
          .transaction-table th {
            background: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Totals section */
          .totals-section { 
            padding: 15px 20px !important;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .totals-title { 
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          
          .total-row { 
            font-size: 12px !important;
            padding: 6px 0 !important;
          }
          
          /* Payment status */
          .payment-status { 
            margin: 15px 20px !important;
            padding: 12px 15px !important;
            font-size: 12px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Footer */
          .footer { 
            padding: 15px 20px !important;
            margin-top: 20px !important;
          }
          
          /* Hide decorative elements */
          .invoice-header::before,
          .invoice-header::after,
          .totals-section::before {
            display: none !important;
          }
          
          /* Force page breaks */
          .page-break {
            page-break-before: always;
          }
          
          /* Ensure no content is cut off */
          html, body {
            width: 210mm;
            min-height: 297mm;
          }
          
          /* Prevent page breaks inside important elements */
          .client-info,
          .transaction-table,
          .expenses-section,
          .totals-content {
            page-break-inside: avoid !important;
          }
        }
        
        @media (max-width: 768px) {
          .invoice-container { margin: 10px; }
          .invoice-header { padding: 30px 20px; }
          .header-content { 
            flex-direction: column;
            gap: 20px;
          }
          .invoice-meta { 
            text-align: left; 
            min-width: auto;
            width: 100%;
          }
          .client-info { 
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .transaction-section, .totals-section, .payment-status, .footer { 
            padding: 30px 20px; 
          }
          .totals-content { max-width: 100%; margin: 0; }
          .expenses-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="header-content">
            <div class="business-info">
              <h1>${business.name}</h1>
              <div class="business-details">
                <div>${business.address}</div>
                <div>${business.phone}</div>
                <div>${business.email}</div>
                ${business.website ? `<div>${business.website}</div>` : ""}
              </div>
            </div>
            <div class="invoice-meta">
              <h2>${invoiceType}</h2>
              <div class="meta-item">
                <span class="meta-label">Invoice #</span>
                <span class="meta-value">${invoiceNumber}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Issue Date</span>
                <span class="meta-value">${new Date(transactionDate).toLocaleDateString()}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Due Date</span>
                <span class="meta-value">${new Date(new Date(transactionDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="client-section">
          <div class="client-info">
            <div class="info-block">
              <h3>${isCustomer ? "Bill To" : "Vendor"}</h3>
              <div class="info-content">
                <div class="client-name">${clientName}</div>
                <div class="client-date">Transaction Date: ${new Date(transactionDate).toLocaleDateString()}</div>
              </div>
            </div>
            <div class="info-block">
              <h3>Payment Status</h3>
              <div class="info-content">
                <div class="client-name" style="color: ${paymentStatus === "paid" ? "#10b981" : paymentStatus === "partial" ? "#f59e0b" : "#ef4444"}">
                  ${safeString(paymentStatus).toUpperCase()}
                </div>
                ${outstandingBalance > 0 ? `<div class="client-date">Outstanding: ₦${safeLocale(outstandingBalance)}</div>` : ""}
              </div>
            </div>
          </div>
        </div>

        <div class="transaction-section">
          <h2 class="section-title">Transaction Details</h2>
          
          <table class="transaction-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Exchange Rate</th>
                <th>Amount (USD)</th>
                <th>Amount (NGN)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="item-name">${safeString(itemPurchased)}</div>
                  <div class="item-details">Primary transaction item</div>
                </td>
                <td>
                  ${itemPurchased === "Dollar" ? `$${safeLocale(quantity)}` : safeString(quantity)}
                </td>
                <td>₦${safeLocale(exchangeRate)}</td>
                <td class="amount-usd">$${safeLocale(transactionData.priceUSD || amountUSD)}</td>
                <td class="amount-ngn">₦${safeLocale(transactionData.priceNGN || amountNGN)}</td>
              </tr>
            </tbody>
          </table>

          ${
            safeNumber(otherExpensesUSD) > 0 || safeNumber(otherExpensesNGN) > 0
              ? `
          <div class="expenses-section">
            <div class="expenses-title">Additional Expenses</div>
            <div class="expenses-grid">
              <div class="expense-item">
                <div class="expense-label">Other Expenses (USD)</div>
                <div class="expense-value amount-usd">$${safeLocale(otherExpensesUSD)}</div>
              </div>
              <div class="expense-item">
                <div class="expense-label">Other Expenses (NGN)</div>
                <div class="expense-value amount-ngn">₦${safeLocale(otherExpensesNGN)}</div>
              </div>
              <div class="expense-item">
                <div class="expense-label">Paid</div>
                <div class="expense-value">₦${safeLocale(transactionData.paid || 0)}</div>
              </div>
            </div>
          </div>
          `
              : ""
          }
        </div>

        <div class="totals-section">
          <div class="totals-content">
            <div class="totals-title">Invoice Summary</div>
            <div class="total-row subtotal">
              <span>Subtotal (USD)</span>
              <span>$${safeLocale(totalUSD)}</span>
            </div>
            <div class="total-row subtotal">
              <span>Subtotal (NGN)</span>
              <span>₦${safeLocale(totalNGN)}</span>
            </div>
            ${
              outstandingBalance > 0
                ? `
            <div class="total-row subtotal">
              <span>Previous Balance</span>
              <span>₦${safeLocale(outstandingBalance)}</span>
            </div>
            <div class="total-row final">
              <span>Balance</span>
              <span>₦${safeLocale(totalNGN + safeNumber(outstandingBalance))}</span>
            </div>
            `
                : `
            <div class="total-row final">
              <span>Balance</span>
              <span>₦${safeLocale(totalNGN)}</span>
            </div>
            `
            }
          </div>
        </div>

        <div class="payment-status ${paymentStatus === "paid" ? "status-paid" : paymentStatus === "partial" ? "status-partial" : "status-unpaid"}">
          Payment Status: ${safeString(paymentStatus).toUpperCase()}
          ${
            outstandingBalance > 0 && paymentStatus !== "paid"
              ? ` • Outstanding Balance: ₦${safeLocale(outstandingBalance)}`
              : ""
          }
        </div>

        <div class="footer">
          <div class="footer-title">Thank you for your business!</div>
          <div class="footer-subtitle">This invoice was generated on ${new Date().toLocaleDateString()}</div>
          
          <div class="payment-instructions">
            <h4>Payment Instructions</h4>
            <p>Please include the invoice number (${invoiceNumber}) in your payment reference. For any questions regarding this invoice, please contact us at ${business.email} or ${business.phone}.</p>
          </div>
        </div>
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
