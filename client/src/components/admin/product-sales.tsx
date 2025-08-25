
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Package,
  TrendingUp,
  Camera,
  Image as ImageIcon,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  inventory: number;
  images?: string[];
  createdAt: string;
}

interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: string;
}

export function ProductSales() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'prints',
    inventory: 0
  });
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/products');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
      }
    },
  });

  // Fetch sales
  const { data: sales = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/sales'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/sales');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch sales:', error);
        return [];
      }
    },
  });

  // Calculate sales analytics
  const salesStats = React.useMemo(() => {
    const totalRevenue = sales.reduce((sum: number, sale: Sale) => sum + sale.totalAmount, 0);
    const totalSales = sales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const recentSales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return saleDate >= thirtyDaysAgo;
    });

    return {
      totalRevenue,
      totalSales,
      avgOrderValue,
      recentSales: recentSales.length,
      topSellingProducts: products.slice(0, 3)
    };
  }, [sales, products]);

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof newProduct) => {
      const response = await apiRequest('POST', '/api/products', productData);
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setProductDialogOpen(false);
      setNewProduct({ name: '', description: '', price: 0, category: 'prints', inventory: 0 });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest('DELETE', `/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0) {
      return;
    }
    createProductMutation.mutate(newProduct);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoadingProducts || isLoadingSales) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading product sales data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{salesStats.totalSales}</p>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(salesStats.avgOrderValue)}</p>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Catalog
                </span>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-bronze">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Create a new product for your photography business.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Product Name</label>
                        <Input
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g., 8x10 Print"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Product description..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Price ($)</label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Inventory</label>
                          <Input
                            type="number"
                            value={newProduct.inventory}
                            onChange={(e) => setNewProduct({ ...newProduct, inventory: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          <option value="prints">Prints</option>
                          <option value="albums">Albums</option>
                          <option value="digital">Digital Downloads</option>
                          <option value="sessions">Session Add-ons</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateProduct}
                          disabled={createProductMutation.isPending}
                          className="btn-bronze"
                        >
                          {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: Product) => (
                    <Card key={product.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{product.category}</Badge>
                              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</p>
                            <p className="text-xs text-muted-foreground">Stock: {product.inventory}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No products created yet.</p>
                  <p className="text-sm text-muted-foreground">Add your first product to start selling!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length > 0 ? (
                <div className="space-y-4">
                  {sales.slice(0, 10).map((sale: Sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{sale.productName}</h3>
                          <Badge variant={sale.status === 'completed' ? 'default' : sale.status === 'pending' ? 'secondary' : 'destructive'}>
                            {sale.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sale.customerName} ({sale.customerEmail})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sale.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(sale.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {sale.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sales recorded yet.</p>
                  <p className="text-sm text-muted-foreground">Sales will appear here once customers start purchasing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                {salesStats.topSellingProducts.length > 0 ? (
                  <div className="space-y-3">
                    {salesStats.topSellingProducts.map((product: Product, index: number) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                        <p className="font-semibold">{formatCurrency(product.price)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No sales data available yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Recent Sales (30 days)</span>
                    <span className="font-semibold">{salesStats.recentSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value</span>
                    <span className="font-semibold">{formatCurrency(salesStats.avgOrderValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Products</span>
                    <span className="font-semibold">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Products</span>
                    <span className="font-semibold">
                      {products.filter((p: Product) => p.status === 'active').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
