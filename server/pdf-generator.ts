import { mkdirSync } from 'fs';
import puppeteer from 'puppeteer';
import { join } from 'path';

// Real HTML to PDF conversion using Puppeteer

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
  businessPhone?: string;
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
      color: #666;
      font-size: 14px;
    }
    .payment-info {
      margin: 20px 0;
      padding: 15px;
      background: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 5px;
    }
    .business-info {
      float: right;
      text-align: right;
    }
    .business-info h2 {
      color: #d4a574;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .contact-info {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
    @media print {
      body { padding: 0; }
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
          Invoice #{{invoiceNumber}}<br>
          Date: {{invoiceDate}}<br>
          Due: {{dueDate}}
        </div>
      </div>
      <div class="business-info">
        <h2>CapturedCCollective</h2>
        <div class="contact-info">
          Christian Picaso Photography<br>
          Hawaii<br>
          Email: info@capturedccollective.com<br>
          Phone: {{businessPhone}}
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

    {{bookingDetailsSection}}

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
      </tbody>
    </table>

    {{notesSection}}

    <div class="footer">
      <p>Thank you for choosing CapturedCCollective for your photography needs!</p>
      <p>Payment can be made via check, cash, or bank transfer. Contact us for payment details.</p>
    </div>
  </div>
</body>
</html>`;

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
  html = html.replace(/\{\{businessPhone\}\}/g, data.businessPhone || '');

  // Generate complete items HTML with all rows
  let itemsHTML = data.items.map(item => 
    '<tr class="item-row">' +
      '<td>' + item.description + '</td>' +
      '<td class="right">' + item.quantity + '</td>' +
      '<td class="right">$' + item.rate.toFixed(2) + '</td>' +
      '<td class="right">$' + item.amount.toFixed(2) + '</td>' +
    '</tr>'
  ).join('');
  
  // Add subtotal row
  itemsHTML += 
    '<tr class="subtotal-row">' +
      '<td colspan="3">Subtotal</td>' +
      '<td class="right">$' + data.subtotal.toFixed(2) + '</td>' +
    '</tr>';

  // Add tax row if applicable
  if (data.tax) {
    itemsHTML += 
      '<tr>' +
        '<td colspan="3">Hawaii GET Tax (' + (data.taxRate || 4.712) + '%)</td>' +
        '<td class="right">$' + data.tax.toFixed(2) + '</td>' +
      '</tr>';
  }

  // Add discount row if applicable
  if (data.discount) {
    itemsHTML += 
      '<tr>' +
        '<td colspan="3">Discount</td>' +
        '<td class="right">-$' + data.discount.toFixed(2) + '</td>' +
      '</tr>';
  }
  
  // Add total row
  itemsHTML += 
    '<tr class="total-row">' +
      '<td colspan="3"><strong>Total</strong></td>' +
      '<td class="right"><strong>$' + data.total.toFixed(2) + '</strong></td>' +
    '</tr>';
  
  // Now replace the placeholder with complete HTML
  html = html.replace(/\{\{items\}\}/g, itemsHTML);

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
  
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp');
    try {
      mkdirSync(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Generate PDF filename
    const filename = `invoice-${data.invoiceNumber}.pdf`;
    const filepath = join(tempDir, filename);

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Set content and wait for page to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF with professional settings
      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      console.log(`✅ PDF invoice generated: ${filepath}`);
      return filepath;

    } finally {
      // Always close browser
      await browser.close();
    }

  } catch (error) {
    console.error('❌ Error generating PDF invoice:', error);
    throw new Error(`Failed to generate PDF invoice: ${(error as Error).message}`);
  }
}

export async function emailInvoice(invoiceData: InvoiceData, pdfPath: string): Promise<boolean> {
  try {
    // Import Neon email service
    const { neonEmailService } = await import('./neon-email.js');
    
    // Send invoice via Neon's email service
    return await neonEmailService.sendInvoiceEmail(invoiceData, pdfPath);
    
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error);
    
    // Fallback to console logging
    console.log(`✉️  Email fallback for: ${invoiceData.clientName} (${invoiceData.clientEmail})`);
    console.log(`📧 Subject: Invoice ${invoiceData.invoiceNumber} from CapturedCCollective`);
    console.log(`📎 PDF attachment: ${pdfPath}`);
    
    return false;
  }
}