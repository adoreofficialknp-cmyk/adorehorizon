
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api.js';
import { format } from 'date-fns';

const SalesAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    aov: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      // Fetch up to 500 recent orders to calculate metrics
      const result = await api.get('/orders?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.orders || d.items || [], totalPages: d.totalPages || 1 }));

      const orders = result.items;

      let totalRev = 0;
      let pendingCount = 0;

      orders.forEach(order => {
        // Calculate Total Revenue (only completed/paid orders)
        if ((order.paymentStatus || order.paymentStatus) === 'completed' || (order.paymentStatus || order.paymentStatus) === 'paid' || (order.orderStatus || order.orderStatus) === 'paid') {
          totalRev += (order.totalAmount || order.total_price || 0);
        }
        
        // Calculate Pending Orders
        if ((order.paymentStatus || order.paymentStatus) === 'pending' || (order.paymentStatus || order.paymentStatus) === 'payment_pending' || (order.orderStatus || order.orderStatus) === 'pending' || (order.orderStatus || order.orderStatus) === 'payment_pending') {
          pendingCount++;
        }
      });

      const totalOrd = orders.length;
      const avgOrderVal = totalOrd > 0 ? totalRev / totalOrd : 0;

      setMetrics({
        totalRevenue: totalRev,
        totalSales: totalOrd,
        pendingOrders: pendingCount,
        aov: avgOrderVal
      });

      // Set recent 10 orders for the table
      setRecentOrders(orders.slice(0, 10));
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'paid', 'delivered', 'shipped'].includes(s)) return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (['pending', 'payment_pending', 'processing'].includes(s)) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    if (['failed', 'cancelled'].includes(s)) return 'bg-red-100 text-red-800 hover:bg-red-100';
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (loading && recentOrders.length === 0 && !error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-2xl w-full" />
      </div>
    );
  }

  if (error && recentOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Data Fetch Error</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={() => { setLoading(true); fetchAnalytics(); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <Helmet><title>Sales Analytics - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Sales Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your store's performance</p>
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); fetchAnalytics(); }} disabled={loading} className="bg-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-[#C6A769]/10 flex items-center justify-center text-[#C6A769] shrink-0">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">₹{metrics.totalRevenue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{metrics.totalSales.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Orders</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{metrics.pendingOrders.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">₹{Math.round(metrics.aov).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <CardTitle className="text-xl font-serif">Recent Orders</CardTitle>
          <CardDescription>Latest 10 transactions from your store</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Order ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {order.orderId || order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        {order.user_name || (order.customerName || order.customer_name) || 'Guest Customer'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{(order.totalAmount || order.total_price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`capitalize font-normal ${getStatusColor((order.paymentStatus || order.paymentStatus))}`}>
                          {(order.paymentStatus || order.paymentStatus) || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize font-normal bg-white">
                          {(order.orderStatus || order.orderStatus) || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {format(new Date((order.createdAt || order.created)), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalyticsPage;
