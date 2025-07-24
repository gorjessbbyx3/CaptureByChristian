import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Truck,
  Image,
  FileText,
  Calendar,
  Star,
  Award,
  Users
} from "lucide-react";
import { format } from "date-fns";

export function ProductSales() {
  return (
    <div className="space-y-6">
      {/* Feature Not Implemented Notice */}
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Sales System</h3>
          <p className="text-muted-foreground mb-4">
            This advanced e-commerce system requires database implementation for products, orders, inventory, and shipping.
            Feature planned for future development.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newProductOpen, setNewProductOpen] = useState(false);

  // Product sales feature requires database implementation
  const products = [
    {
      id: 1,
      name: "8x10 Premium Prints",
      description: "Professional quality prints on premium photo paper",
      category: "prints",
      price: 25.00,
      cost: 8.50,
      sku: "PRINT-8X10",
      variants: [
        { name: "Matte Finish", price: 25.00 },
        { name: "Glossy Finish", price: 25.00 },
        { name: "Metallic Finish", price: 35.00 }
      ],
      active: true,
      sales: 45,
      revenue: 1125.00,
      createdAt: "2025-06-01T10:00:00Z"
    },
    {
      id: 2,
      name: "Wedding Album - Luxury",
      description: "50-page premium leather wedding album with custom design",
      category: "albums",
      price: 450.00,
      cost: 180.00,
      sku: "ALBUM-WEDDING-LUX",
      variants: [
        { name: "Black Leather", price: 450.00 },
        { name: "Brown Leather", price: 450.00 },
        { name: "White Leather", price: 475.00 }
      ],
      active: true,
      sales: 8,
      revenue: 3600.00,
      createdAt: "2025-05-15T14:30:00Z"
    },
    {
      id: 3,
      name: "Canvas Wall Art - 16x20",
      description: "Gallery-wrapped canvas prints ready to hang",
      category: "canvas",
      price: 85.00,
      cost: 25.00,
      sku: "CANVAS-16X20",
      variants: [
        { name: "Standard Wrap", price: 85.00 },
        { name: "Floating Frame", price: 125.00 }
      ],
      active: true,
      sales: 23,
      revenue: 1955.00,
      createdAt: "2025-05-20T09:15:00Z"
    },
    {
      id: 4,
      name: "Digital Download Package",
      description: "High-resolution digital files with print release",
      category: "digital",
      price: 150.00,
      cost: 0.00,
      sku: "DIGITAL-PACK",
      variants: [
        { name: "Standard Resolution", price: 150.00 },
        { name: "High Resolution + RAW", price: 250.00 }
      ],
      active: true,
      sales: 67,
      revenue: 10050.00,
      createdAt: "2025-04-10T16:45:00Z"
    },
    {
      id: 5,
      name: "Portrait Session Prints",
      description: "Curated print package from portrait sessions",
      category: "prints",
      price: 75.00,
      cost: 20.00,
      sku: "PORTRAIT-PRINTS",
      variants: [
        { name: "5 Prints (5x7)", price: 75.00 },
        { name: "10 Prints (5x7)", price: 125.00 },
        { name: "Mixed Size Package", price: 150.00 }
      ],
      active: true,
      sales: 31,
      revenue: 2325.00,
      createdAt: "2025-03-25T11:20:00Z"
    }
  ];

  // Mock orders data
  const orders = [
    {
      id: 1,
      clientId: 1,
      clientName: "Sarah Johnson",
      items: [
        { productId: 2, variant: "Black Leather", quantity: 1, price: 450.00 },
        { productId: 1, variant: "Matte Finish", quantity: 10, price: 250.00 }
      ],
      subtotal: 700.00,
      tax: 56.00,
      shipping: 15.00,
      total: 771.00,
      status: "shipped",
      trackingNumber: "1Z999AA1234567890",
      createdAt: "2025-07-08T14:30:00Z",
      fulfilledAt: "2025-07-10T09:15:00Z"
    },
    {
      id: 2,
      clientId: 3,
      clientName: "Emily Rodriguez",
      items: [
        { productId: 3, variant: "Floating Frame", quantity: 2, price: 250.00 },
        { productId: 4, variant: "High Resolution + RAW", quantity: 1, price: 250.00 }
      ],
      subtotal: 500.00,
      tax: 40.00,
      shipping: 20.00,
      total: 560.00,
      status: "processing",
      trackingNumber: null,
      createdAt: "2025-07-09T16:20:00Z",
      fulfilledAt: null
    },
    {
      id: 3,
      clientId: 5,
      clientName: "Jessica Martinez",
      items: [
        { productId: 5, variant: "Mixed Size Package", quantity: 1, price: 150.00 }
      ],
      subtotal: 150.00,
      tax: 12.00,
      shipping: 10.00,
      total: 172.00,
      status: "pending",
      trackingNumber: null,
      createdAt: "2025-07-11T10:45:00Z",
      fulfilledAt: null
    }
  ];

  const productStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.active).length,
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    totalSales: products.reduce((sum, p) => sum + p.sales, 0),
    avgOrderValue: 305.00,
    topCategory: "Digital"
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "prints": return <Image className="h-4 w-4" />;
      case "albums": return <FileText className="h-4 w-4" />;
      case "canvas": return <Award className="h-4 w-4" />;
      case "digital": return <Package className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shipped": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return Math.round(((price - cost) / price) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-bronze" />
              <div>
                <p className="text-2xl font-bold">{productStats.totalProducts}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{productStats.totalSales}</p>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${productStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">${productStats.avgOrderValue}</p>
                <p className="text-xs text-muted-foreground">Avg Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{productStats.topCategory}</p>
                <p className="text-xs text-muted-foreground">Top Category</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Catalog
            </span>
            <Button className="btn-bronze" onClick={() => setNewProductOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-bronze">
                        {getCategoryIcon(product.category)}
                      </div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost</p>
                        <p className="font-medium">${product.cost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className="font-medium">{calculateMargin(product.price, product.cost)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-medium">{product.sku}</p>
                      </div>
                    </div>

                    {/* Product Variants */}
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Variants:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant, index) => (
                          <Badge key={index} variant="outline">
                            {variant.name} - ${variant.price.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-4">
                      <div className="text-lg font-bold text-bronze">{product.sales}</div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                      <div className="text-lg font-bold text-green-600">${product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold">Order #{order.id.toString().padStart(3, '0')}</h3>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">{order.clientName}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {order.trackingNumber && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Truck className="h-3 w-3 mr-1" />
                          {order.trackingNumber}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{products.find(p => p.id === item.productId)?.name} ({item.variant})</span>
                          <span>{item.quantity}x ${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
                        <p><strong>Tax:</strong> ${order.tax.toFixed(2)}</p>
                        <p><strong>Shipping:</strong> ${order.shipping.toFixed(2)}</p>
                      </div>
                      <div>
                        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                        <p><strong>Ordered:</strong> {format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        {order.fulfilledAt && (
                          <p><strong>Fulfilled:</strong> {format(new Date(order.fulfilledAt), "MMM d, yyyy")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 mb-2">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {order.status === "pending" && (
                        <Button size="sm" className="btn-bronze">
                          <Truck className="h-3 w-3 mr-1" />
                          Fulfill
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Product Dialog */}
      <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input placeholder="e.g., Wedding Album - Premium" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prints">Prints</SelectItem>
                    <SelectItem value="albums">Albums</SelectItem>
                    <SelectItem value="canvas">Canvas</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Product description..." />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium">Cost</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input placeholder="PRODUCT-SKU" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNewProductOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-bronze">
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}