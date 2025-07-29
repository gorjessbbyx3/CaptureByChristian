import { writeFileSync /*, readFileSync */ } from 'fs';
import { join } from 'path';

// Simple HTML to PDF conversion using Puppeteer-like approach
// In production, you'd use puppeteer, playwright, or a service like PDFShift

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  notes?: string;
  bookingDetails?: {
    serviceName: string;
    bookingDate: string;
    location: string;
  };
}

const INVOICE_HTML_TEMPLATE = 
`<!DOCTYPE html>
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
    @media print {
      body { margin: 0; padding: 20px; }
      .invoice-box { box-shadow: none; border: none; }
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
        <div style="width: 150px; height: 80px; background: #d4a574; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 5px;">
          <div style="font-size: 14px; font-weight: bold;">CapturedC</div>
          <div style="font-size: 14px; font-weight: bold;">Collective</div>
          <div style="font-size: 10px;">Media Team</div>
        </div>
      </div>
    </div>

    <div class="billing-info">
      <div class="billing-title">Bill To:</div>
      <strong>{{clientName}}</strong><br>
      {{clientEmail}}<br>
      {{clientPhone}}<br>
      {{clientAddress}}
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
        {{items}}
        
        <tr class="subtotal-row">
          <td colspan="3">Subtotal</td>
          <td class="right">\${{subtotal}}</td>
        </tr>
        
        {{taxRow}}
        
        {{discountRow}}
        
        <tr class="total-row">
          <td colspan="3"><strong>TOTAL</strong></td>
          <td class="right"><strong>\${{total}}</strong></td>
        </tr>
      </tbody>
    </table>

    {{bookingDetailsSection}}

    {{notesSection}}

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

export function generateInvoiceHTML(data: InvoiceData): string {
  let html = INVOICE_HTML_TEMPLATE;

  // Replace basic fields
  html = html.replace(/\{\{invoiceNumber\}\}/g, data.invoiceNumber);
  html = html.replace(/\{\{invoiceDate\}\}/g, data.invoiceDate);
  html = html.replace(/\{\{dueDate\}\}/g, data.dueDate);
  html = html.replace(/\{\{clientName\}\}/g, data.clientName);
  html = html.replace(/\{\{clientEmail\}\}/g, data.clientEmail);
  html = html.replace(/\{\{clientPhone\}\}/g, data.clientPhone || '');
  html = html.replace(/\{\{clientAddress\}\}/g, data.clientAddress || '');
  html = html.replace(/\{\{subtotal\}\}/g, data.subtotal.toFixed(2));
  html = html.replace(/\{\{total\}\}/g, data.total.toFixed(2));

  // Generate items HTML
  const itemsHTML = data.items.map(item => `
    <tr class="item-row">
      <td>${item.description}</td>
      <td class="right">${item.quantity}</td>
      <td class="right">$${item.rate.toFixed(2)}</td>
      <td class="right">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');
  html = html.replace(/\{\{items\}\}/g, itemsHTML);

  // Handle tax row
  const taxRow = data.tax ? `
    <tr>
      <td colspan="3">Tax (${data.taxRate || 0}%)</td>
      <td class="right">$${data.tax.toFixed(2)}</td>
    </tr>
  ` : '';
  html = html.replace(/\{\{taxRow\}\}/g, taxRow);

  // Handle discount row
  const discountRow = data.discount ? `
    <tr>
      <td colspan="3">Discount</td>
      <td class="right">-$${data.discount.toFixed(2)}</td>
    </tr>
  ` : '';
  html = html.replace(/\{\{discountRow\}\}/g, discountRow);

  // Handle booking details
  const bookingDetailsSection = data.bookingDetails ? `
    <div class="payment-info">
      <strong>Booking Details:</strong><br>
      Service: ${data.bookingDetails.serviceName}<br>
      Date: ${data.bookingDetails.bookingDate}<br>
      Location: ${data.bookingDetails.location}
    </div>
  ` : '';
  html = html.replace(/\{\{bookingDetailsSection\}\}/g, bookingDetailsSection);

  // Handle notes
  const notesSection = data.notes ? `
    <div class="notes-section">
      <div class="notes-title">Notes:</div>
      ${data.notes}
    </div>
  ` : '';
  html = html.replace(/\{\{notesSection\}\}/g, notesSection);

  return html;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const html = generateInvoiceHTML(data);
  
  // In a real implementation, you would use:
  // - puppeteer for server-side PDF generation
  // - PDFKit for programmatic PDF creation
  // - A service like PDFShift, DocRaptor, or Bannerbear
  
  // For this demo, we'll save the HTML and return a mock PDF path
  const filename = `invoice-${data.invoiceNumber}.html`;
  const filepath = join(process.cwd(), 'temp', filename);
  
  try {
    writeFileSync(filepath, html);
    console.log(`Invoice HTML generated: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

export async function emailInvoice(invoiceData: InvoiceData, pdfPath: string): Promise<boolean> {
  // Validate email address first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!invoiceData.clientEmail || !emailRegex.test(invoiceData.clientEmail)) {
    console.log(`Invalid email address: ${invoiceData.clientEmail}`);
    return false;
  }
  
  // In a real implementation, you would integrate with:
  // - SendGrid, Mailgun, or AWS SES for email delivery
  // - Include the PDF as an attachment
  // - Add payment links (Stripe Checkout URLs)
  
  console.log(`Email would be sent to: ${invoiceData.clientName} (${invoiceData.clientEmail})`);
  console.log(`Subject: Invoice ${invoiceData.invoiceNumber} from Christian Picaso Photography`);
  console.log(`PDF attachment: ${pdfPath}`);
  
  const emailContent = `
Dear ${invoiceData.clientName},

Thank you for choosing Christian Picaso Photography! 

Please find your invoice (${invoiceData.invoiceNumber}) attached. The total amount due is $${invoiceData.total.toFixed(2)}.

Payment is due by ${invoiceData.dueDate}. You can pay securely online using the link below:
[SECURE PAYMENT LINK - Would be generated by Stripe/PayPal]

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
Christian Picaso
Christian Picaso Photography
Hawaii
  `;
  
  console.log('Email content:', emailContent);
  
  // Mock successful email send
  return true;
}