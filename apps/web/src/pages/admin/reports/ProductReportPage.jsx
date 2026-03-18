
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '@/lib/api.js';
import { exportToCSV } from '@/utils/exportUtils';

const ProductReportPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRecord = await api.get('/products?limit=1000').then(d => Array.isArray(d) ? d : d.items || []).catch(() => []);
        
        const ordersRecord = await api.get('/orders?limit=1000').then(d => Array.isArray(d) ? d : d.orders || d.items || []).catch(() => []);

        // Calculate sales per product
        const productSales = {};
        ordersRecord.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const id = item.product_id || item.id;
              if (!productSales[id]) {
                productSales[id] = { quantity: 0, revenue: 0 };
              }
              productSales[id].quantity += (item.quantity || 1);
              productSales[id].revenue += ((item.price || 0) * (item.quantity || 1));
            });
          }
        });

        const enrichedProducts = productsRecord.map(p => ({
          ...p,
          units_sold: productSales[p.id]?.quantity || 0,
          revenue: productSales[p.id]?.revenue || 0
        })).sort((a, b) => b.revenue - a.revenue);

        setProducts(enrichedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleExport = () => {
    const exportData = products.map(p => ({
      'Product Name': p.name,
      'Category': p.category,
      'Price': p.price,
      'Current Stock': p.stock,
      'Units Sold': p.units_sold,
      'Total Revenue': p.revenue
    }));
    exportToCSV(exportData, 'product_performance_report');
  };

  if (loading) return <div className="p-8">Loading report...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Helmet><title>Product Performance - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Product Performance</h1>
          <p className="text-muted-foreground">Analyze sales and inventory metrics</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Package className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold">{products.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Units Sold</p>
              <h3 className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.units_sold, 0)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <h3 className="text-2xl font-bold">{products.filter(p => p.stock < 5).length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Sales Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-4">Product Name</TableHead>
                  <TableHead className="py-4">Category</TableHead>
                  <TableHead className="py-4 text-right">Price</TableHead>
                  <TableHead className="py-4 text-right">Stock</TableHead>
                  <TableHead className="py-4 text-right">Units Sold</TableHead>
                  <TableHead className="py-4 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="capitalize">{(product.category?.name || product.category)}</TableCell>
                    <TableCell className="text-right">₹{(product.price || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock < 5 ? 'text-red-600 font-bold' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{product.units_sold}</TableCell>
                    <TableCell className="text-right text-primary font-bold">₹{product.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReportPage;
