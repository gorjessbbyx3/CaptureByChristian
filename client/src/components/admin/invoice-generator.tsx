import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Plus,
  DollarSign,
  Calendar,
  User,
  Eye,
  Trash,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  bookingId?: number;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdDate: string;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceTotals {
  subtotal: number;
  taxRate: number;
  tax: number;
  discountRate: number;
  discount: number;
  total: number;
}

export function InvoiceGenerator() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: "Photography Session", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(4.712); // Hawaii General Excise Tax
  const [discountRate, setDiscountRate] = useState(0);
  const [notes, setNotes] = useState(
    "Payment due within 30 days of invoice date. Late payments may incur additional fees.",
  );
  const { toast } = useToast();

  const { data: bookings } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: fetchBookings,
  });

  const { data: invoiceStats = {} } = useQuery({
    queryKey: ["/api/invoices/stats"],
    queryFn: () => fetch("/api/invoices/stats").then((r) => r.json()),
  });

  // Fetch real invoices from database
  const { data: invoicesData } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const response = await fetch("/api/invoices");
      return response.json();
    },
  });

  const invoices: Invoice[] = invoicesData || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const quantity =
        field === "quantity"
          ? Number(value) || 0
          : updated[index].quantity || 0;
      const rate =
        field === "rate" ? Number(value) || 0 : updated[index].rate || 0;
      updated[index].amount = Number((quantity * rate).toFixed(2));
    }

    setInvoiceItems(updated);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = (): InvoiceTotals => {
    const subtotal = invoiceItems.reduce(
      (total, item) =>
        total + (typeof item.amount === "number" ? item.amount : 0),
      0,
    );
    const tax = (subtotal * taxRate) / 100;
    const discount = (subtotal * discountRate) / 100;
    const total = subtotal + tax - discount;

    return {
      subtotal,
      taxRate,
      tax,
      discountRate,
      discount,
      total,
    };
  };

  const getTotalAmount = () => {
    return calculateTotals().total;
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900) + 100;
    return `INV-${year}-${random}`;
  };

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      id: generateInvoiceNumber(),
      bookingId: selectedBooking?.id,
      clientName: selectedBooking?.client.name || "Manual Client",
      clientEmail: selectedBooking?.client.email || "",
      invoiceNumber: generateInvoiceNumber(),
      amount: getTotalAmount(),
      status: "pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
      items: [...invoiceItems],
      notes: "",
    };

    toast({
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
    });

    setNewInvoiceOpen(false);
    setSelectedBooking(null);
    setInvoiceItems([
      { description: "Photography Session", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(
        `/api/invoices/send/${invoice.invoiceNumber}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice,
            includePaymentLink: true,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: `Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`,
        });
      } else {
        throw new Error("Email send failed");
      }
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Unable to send invoice email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(
        `/api/invoices/pdf/${invoice.invoiceNumber}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoice),
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Complete",
          description: `Invoice ${invoice.invoiceNumber} downloaded successfully`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pendingBookings = bookings?.filter(
    (booking: any) =>
      booking.status === "confirmed" || booking.status === "completed",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice & Contract Management</h2>
          <p className="text-muted-foreground">
            Generate and manage invoices for your photography services
          </p>
        </div>

        <Dialog open={newInvoiceOpen} onOpenChange={setNewInvoiceOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bronze hover:bg-bronze/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Client Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Booking (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const booking = pendingBookings?.find(
                        (b: any) => b.id.toString() === value,
                      );
                      setSelectedBooking(booking);
                      if (booking) {
                        const servicePrice = Number(booking.service.price) || 0;
                        setInvoiceItems([
                          {
                            description: booking.service.name,
                            quantity: 1,
                            rate: servicePrice,
                            amount: servicePrice,
                          },
                        ]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from existing bookings" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingBookings?.map((booking: any) => (
                        <SelectItem
                          key={booking.id}
                          value={booking.id.toString()}
                        >
                          {booking.client.name} - {booking.service.name} -{" "}
                          {new Date(booking.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Invoice Number</Label>
                  <Input value={generateInvoiceNumber()} disabled />
                </div>
              </div>

              {/* Client Info */}
              {selectedBooking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Client Name</Label>
                      <Input value={selectedBooking.client.name} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={selectedBooking.client.email} disabled />
                    </div>
                    <div>
                      <Label>Booking Date</Label>
                      <Input
                        value={new Date(
                          selectedBooking.date,
                        ).toLocaleDateString()}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Service</Label>
                      <Input value={selectedBooking.service.name} disabled />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoiceItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-6 gap-2 items-end"
                      >
                        <div className="col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateInvoiceItem(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Service description"
                          />
                        </div>
                        <div>
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateInvoiceItem(
                                index,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Rate ($)</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateInvoiceItem(
                                index,
                                "rate",
                                Number(e.target.value),
                              )
                            }
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Amount ($)</Label>
                          <Input
                            value={
                              typeof item.amount === "number"
                                ? item.amount.toFixed(2)
                                : "0.00"
                            }
                            disabled
                          />
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeInvoiceItem(index)}
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addInvoiceItem}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>

                    <div className="border-t pt-4">
                      {/* Tax and Discount Controls */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Tax Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            placeholder="4.712"
                          />
                        </div>
                        <div>
                          <Label>Discount Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={discountRate}
                            onChange={(e) =>
                              setDiscountRate(Number(e.target.value))
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Invoice Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${calculateTotals().subtotal.toFixed(2)}</span>
                        </div>
                        {taxRate > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Tax ({taxRate}%):</span>
                            <span>${calculateTotals().tax.toFixed(2)}</span>
                          </div>
                        )}
                        {discountRate > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({discountRate}%):</span>
                            <span>
                              -${calculateTotals().discount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-xl font-bold text-bronze">
                            ${getTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <div>
                <Label>Notes & Payment Terms</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, special instructions, late fee policy..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setNewInvoiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  className="bg-bronze hover:bg-bronze/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${invoiceStats.totalRevenue?.toLocaleString() || "0"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${invoiceStats.pendingAmount?.toLocaleString() || "0"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  ${invoiceStats.overdueAmount?.toLocaleString() || "0"}
                </p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoiceStats.paymentRate || "0"}%
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm">
                Create your first invoice using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-semibold">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.clientName} • Created{" "}
                        {new Date(invoice.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog
        open={!!previewInvoice}
        onOpenChange={() => setPreviewInvoice(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>

          {previewInvoice && (
            <div className="space-y-8 p-8 border-2 rounded-lg bg-white text-gray-900 shadow-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6">
                <div>
                  <h2 className="text-4xl font-bold text-bronze mb-2">
                    INVOICE
                  </h2>
                  <p className="text-lg font-semibold text-gray-800">
                    CapturedCCollective
                  </p>
                  <p className="text-base text-gray-700">
                    Professional Photography Services
                  </p>
                  <p className="text-sm text-gray-600">Honolulu, Hawaii</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {previewInvoice.invoiceNumber}
                  </div>
                  <div className="text-base font-medium text-gray-800 mt-2">
                    Date:{" "}
                    {new Date(previewInvoice.createdDate).toLocaleDateString()}
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    Due: {new Date(previewInvoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Bill To:
                </h3>
                <div className="text-base text-gray-800">
                  <div className="font-semibold">
                    {previewInvoice.clientName}
                  </div>
                  <div className="text-gray-700">
                    {previewInvoice.clientEmail}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left p-4 font-bold text-gray-900">
                        Description
                      </th>
                      <th className="text-right p-4 font-bold text-gray-900">
                        Qty
                      </th>
                      <th className="text-right p-4 font-bold text-gray-900">
                        Rate
                      </th>
                      <th className="text-right p-4 font-bold text-gray-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-4 text-gray-800 font-medium">
                          {item.description}
                        </td>
                        <td className="text-right p-4 text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="text-right p-4 text-gray-800">
                          ${item.rate.toFixed(2)}
                        </td>
                        <td className="text-right p-4 text-gray-800 font-semibold">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-bronze/10 border-t-2 border-bronze">
                      <td
                        colSpan={3}
                        className="text-right p-4 font-bold text-gray-900 text-lg"
                      >
                        Total:
                      </td>
                      <td className="text-right p-4 font-bold text-gray-900 text-xl">
                        ${previewInvoice.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Notes */}
              {previewInvoice.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    Notes:
                  </h3>
                  <p className="text-base text-gray-800">
                    {previewInvoice.notes}
                  </p>
                </div>
              )}

              {/* Payment Terms */}
              <div className="border-t-2 border-gray-300 pt-6">
                <p className="text-base text-gray-700 font-medium">
                  Payment terms: Net 30 days. Thank you for your business!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Questions? Contact us at info@capturedbychristian.com
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
