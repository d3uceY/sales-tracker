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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 10px;
          color: #1f2937;
          line-height: 1.3;
          font-size: 12px;
        }
        
        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          position: relative;
        }
        
        .invoice-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        }
        
        .invoice-header { 
          padding: 20px 25px 15px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: start;
        }
        
        .business-info {
          display: flex;
          flex-direction: column;
        }
        
        .business-info h1 { 
          color: #1e293b;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.025em;
        }
        
        .business-contact {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 8px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
        }
        
        .contact-icon {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }
        
        .invoice-details { 
          text-align: right;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .invoice-details h2 { 
          color: #dc2626;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.025em;
        }
        
        .invoice-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        
        .meta-label {
          color: #64748b;
          font-weight: 500;
        }
        
        .meta-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        .client-section { 
          padding: 0 40px;
          margin: 30px 0;
        }
        
        .client-card {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
        }
        
        .client-card h3 { 
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          opacity: 0.9;
        }
        
        .client-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .client-date {
          opacity: 0.8;
          font-size: 14px;
          font-weight: 500;
        }
        
        .transaction-section {
          padding: 0 40px;
          margin: 40px 0;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
          padding-left: 10px;
          border-left: 3px solid #3b82f6;
        }
        
        .transaction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .detail-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
          transition: all 0.2s ease;
        }
        
        .detail-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -3px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }
        
        .detail-label {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }
        
        .detail-value {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .currency-usd {
          color: #059669;
        }
        
        .currency-ngn {
          color: #dc2626;
        }
        
        .item-card {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          border: 1px solid #cbd5e1;
        }
        
        .item-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .item-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        
        .item-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        }
        
        .totals-section { 
          padding: 0 25px;
          margin: 15px 0;
        }
        
        .totals-card {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          border-radius: 12px;
          padding: 15px;
          max-width: 350px;
          margin-left: auto;
          box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.3);
        }
        
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 6px 0;
          font-size: 12px;
          font-weight: 500;
        }
        
        .total-row:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .total-row.final { 
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          font-weight: 700;
          font-size: 16px;
          color: #10b981;
        }
        
        .payment-status { 
          margin: 15px 25px;
          padding: 12px 20px;
          border-radius: 10px;
          text-align: center;
          font-weight: 600;
          font-size: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .payment-status::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .payment-status:hover::before {
          left: 100%;
        }
        
        .status-paid { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
        }
        
        .status-unpaid { 
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.3);
        }
        
        .footer { 
          background: #f8fafc;
          padding: 15px 25px;
          text-align: center; 
          color: #64748b;
          font-size: 10px;
          font-weight: 500;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p:first-child {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 2px;
        }
        
        @media (max-width: 768px) {
          body { padding: 8px; }
          .invoice-container { border-radius: 10px; }
          .invoice-header { 
            padding: 15px;
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .invoice-details { text-align: left; }
          .transaction-section, .client-section, .totals-section { padding: 0 15px; }
          .payment-status { margin: 15px; }
          .footer { padding: 15px; }
          .transaction-grid { grid-template-columns: 1fr 1fr; }
          .totals-card { max-width: 100%; margin: 0; }
        }
        
        @media print {
          body { 
            background: white;
            padding: 0;
          }
          .invoice-container {
            box-shadow: none;
            border-radius: 0;
          }
          .detail-card:hover {
            transform: none;
            box-shadow: none;
          }
          .payment-status::before {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="business-info">
            <h1>${business.name}</h1>
            <div class="business-contact">
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                ${business.email}
              </div>
            </div>
          </div>
          <div class="invoice-details">
            <h2>${invoiceType}</h2>
            <div class="invoice-meta">
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
          <div class="client-card">
            <h3>${isCustomer ? "Bill To" : "Vendor"}</h3>
            <div class="client-name">${clientName}</div>
            <div class="client-date">Transaction Date: ${new Date(transactionDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="transaction-section">
          <h2 class="section-title">Transaction Details</h2>
          
          <div class="item-card">
            <div class="item-header">
              <div class="item-name">${safeString(itemPurchased)}</div>
            </div>
            <div class="item-details">
              <div class="detail-card">
                <div class="detail-label">Quantity</div>
                <div class="detail-value">
                  ${itemPurchased === "Dollar" ? `${safeLocale(quantity)}` : safeString(quantity)}
                </div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Exchange Rate</div>
                <div class="detail-value">₦${safeLocale(exchangeRate)}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Amount (USD)</div>
                <div class="detail-value currency-usd">$${safeLocale(transactionData.priceUSD || amountUSD)}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Amount (NGN)</div>
                <div class="detail-value currency-ngn">₦${safeLocale(transactionData.priceNGN || amountNGN)}</div>
              </div>
            </div>
          </div>

          ${(safeNumber(otherExpensesUSD) > 0 || safeNumber(otherExpensesNGN) > 0) ? `
          <h3 class="section-title" style="font-size: 14px; margin-top: 20px; margin-bottom: 10px;">Additional Expenses</h3>
          <div class="transaction-grid">
            <div class="detail-card">
              <div class="detail-label">Other Expenses (USD)</div>
              <div class="detail-value currency-usd">${safeLocale(otherExpensesUSD)}</div>
            </div>
            <div class="detail-card">
              <div class="detail-label">Other Expenses (NGN)</div>
              <div class="detail-value currency-ngn">₦${safeLocale(otherExpensesNGN)}</div>
            </div>
          </div>
          ` : ''}

          <div class="transaction-grid">
            <div class="detail-card">
              <div class="detail-label">Amount Paid + Outstanding Balance</div>
              <div class="detail-value currency-ngn">₦${safeLocale(transactionData.amountPaid || 0)}</div>
            </div>
            <div class="detail-card">
              <div class="detail-label">Outstanding Balance</div>
              <div class="detail-value currency-ngn">₦${safeLocale(outstandingBalance)}</div>
            </div>
            <div class="detail-card">
              <div class="detail-label">Payment Status</div>
              <div class="detail-value" style="color: ${paymentStatus === 'paid' ? '#10b981' : '#ef4444'}">
                ${safeString(paymentStatus).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div class="totals-section">
          <div class="totals-card">
            <div class="total-row">
              <span>Subtotal (USD)</span>
              <span>$${safeLocale(totalUSD)}</span>
            </div>
            <div class="total-row">
              <span>Subtotal (NGN)</span>
              <span>₦${safeLocale(totalNGN)}</span>
            </div>
            ${
              outstandingBalance > 0
                ? `
            <div class="total-row">
              <span>Previous Balance</span>
              <span>₦${safeLocale(outstandingBalance)}</span>
            </div>
            <div class="total-row final">
              <span>Total Amount</span>
              <span>₦${safeLocale(totalNGN + safeNumber(outstandingBalance))}</span>
            </div>
            `
                : `
            <div class="total-row final">
              <span>Total Amount</span>
              <span>₦${safeLocale(totalNGN)}</span>
            </div>
            `
            }
          </div>
        </div>

        <div class="payment-status ${paymentStatus === "paid" ? "status-paid" : "status-unpaid"}">
          Payment Status: ${safeString(paymentStatus).toUpperCase()}
          ${
            outstandingBalance > 0 && paymentStatus === "unpaid"
              ? `<br><br>Outstanding Balance: ₦${safeLocale(outstandingBalance)}`
              : ""
          }
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This invoice was generated on ${new Date().toLocaleDateString()}</p>
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