export const INVOICE_HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
      background: #fff;
    }
    .invoice-box {
      max-width: 800px;
      margin: auto;
      padding: 40px;
      border: 1px solid #eee;
      box-shadow: 0 0 15px rgba(0,0,0,.1);
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #d4a574;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #d4a574;
      margin: 0;
    }
    .invoice-meta {
      font-size: 14px;
      color: #666;
    }
    .billing-info {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #d4a574;
    }
    .billing-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table th {
      background: #d4a574;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: bold;
    }
    .items-table th.right {
      text-align: right;
    }
    .items-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }
    .items-table td.right {
      text-align: right;
    }
    .item-row:nth-child(even) {
      background: #f9f9f9;
    }
    .subtotal-row {
      border-top: 2px solid #ddd;
      font-weight: bold;
    }
    .total-row {
      background: #d4a574;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    .notes-section {
      margin-top: 40px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .payment-info {
      margin: 30px 0;
      padding: 20px;
      background: #e8f4f8;
      border-radius: 5px;
      border-left: 4px solid #2196f3;
    }
    .due-date {
      font-weight: bold;
      color: #d32f2f;
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <h1 class="invoice-title">INVOICE</h1>
        <div class="invoice-meta">
          <strong>Invoice #:</strong> {{invoiceNumber}}<br>
          <strong>Date:</strong> {{invoiceDate}}<br>
          <strong>Due Date:</strong> <span class="due-date">{{dueDate}}</span>
        </div>
      </div>
      <div>
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZDRhNTc0Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hyaXN0aWFuPC90ZXh0Pgo8dGV4dCB4PSI2MCIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZhbG9uem88L3RleHQ+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QaG90b2dyYXBoeTwvdGV4dD4KPC9zdmc+Cg==" class="logo" alt="Christian Falonzo Photography">
      </div>
    </div>

    <div class="billing-info">
      <div class="billing-title">Bill To:</div>
      <strong>{{clientName}}</strong><br>
      {{clientEmail}}<br>
      {{#clientPhone}}{{clientPhone}}<br>{{/clientPhone}}
      {{#clientAddress}}{{clientAddress}}{{/clientAddress}}
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="right">Qty</th>
          <th class="right">Rate</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#items}}
        <tr class="item-row">
          <td>{{description}}</td>
          <td class="right">{{quantity}}</td>
          <td class="right">\${{rate}}</td>
          <td class="right">\${{amount}}</td>
        </tr>
        {{/items}}
        
        <tr class="subtotal-row">
          <td colspan="3">Subtotal</td>
          <td class="right">\${{subtotal}}</td>
        </tr>
        
        {{#tax}}
        <tr>
          <td colspan="3">Tax ({{taxRate}}%)</td>
          <td class="right">\${{tax}}</td>
        </tr>
        {{/tax}}
        
        {{#discount}}
        <tr>
          <td colspan="3">Discount</td>
          <td class="right">-\${{discount}}</td>
        </tr>
        {{/discount}}
        
        <tr class="total-row">
          <td colspan="3"><strong>TOTAL</strong></td>
          <td class="right"><strong>\${{total}}</strong></td>
        </tr>
      </tbody>
    </table>

    {{#bookingDetails}}
    <div class="payment-info">
      <strong>Booking Details:</strong><br>
      Service: {{serviceName}}<br>
      Date: {{bookingDate}}<br>
      Location: {{location}}
    </div>
    {{/bookingDetails}}

    {{#notes}}
    <div class="notes-section">
      <div class="notes-title">Notes:</div>
      {{notes}}
    </div>
    {{/notes}}

    <div class="payment-info">
      <strong>Payment Information:</strong><br>
      Please make payment by <strong>{{dueDate}}</strong><br>
      Payment can be made via the secure link provided in your email or by contacting us directly.<br>
      <em>Late payments may incur additional fees.</em>
    </div>

    <div class="footer">
      <p><strong>Christian Picaso Photography</strong><br>
      Professional Photography Services • Hawaii<br>
      Email: contact@christianpicaso.com • Website: www.christianpicaso.com</p>
      <p style="margin-top: 20px;">Thank you for choosing Christian Picaso Photography!</p>
    </div>
  </div>
</body>
</html>
`;

export const generateInvoiceHTML = (invoiceData: any) => {
  // Simple template replacement (in production, use a proper template engine)
  let html = INVOICE_HTML_TEMPLATE;

  // Replace single values
  Object.keys(invoiceData).forEach((key) => {
    if (
      typeof invoiceData[key] === "string" ||
      typeof invoiceData[key] === "number"
    ) {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, invoiceData[key].toString());
    }
  });

  // Handle items array
  if (invoiceData.items && Array.isArray(invoiceData.items)) {
    const itemsHTML = invoiceData.items
      .map(
        (item: any) => `
      <tr class="item-row">
        <td>${item.description}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">$${item.rate.toFixed(2)}</td>
        <td class="right">$${item.amount.toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    html = html.replace(/{{#items}}[\s\S]*?{{\/items}}/g, itemsHTML);
  }

  // Handle conditional sections
  const conditionalSections = [
    "tax",
    "discount",
    "clientPhone",
    "clientAddress",
    "bookingDetails",
    "notes",
  ];
  conditionalSections.forEach((section) => {
    const regex = new RegExp(
      `{{#${section}}}([\\s\\S]*?){{\\/${section}}}`,
      "g",
    );
    if (invoiceData[section]) {
      html = html.replace(regex, "$1");
    } else {
      html = html.replace(regex, "");
    }
  });

  return html;
};
