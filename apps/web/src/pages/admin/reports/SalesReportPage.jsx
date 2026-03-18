
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, TrendingUp, ShoppingBag, DollarSign, CreditCard } from 'lucide-react';
import api from '@/lib/api.js';
import { exportToCSV } from '@/utils/exportUtils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const SalesReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedPayments: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const records = await api.get('/orders?limit=1000').then(d => Array.isArray(d) ? d : d.orders || d.items || []).catch(() => []);
        
        setOrders(records);

        const totalRevenue = records.reduce((sum, o) => sum + (o.totalAmount || o.total_price || 0), 0);
        const completedPayments = records.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed').length;

        setMetrics({
          totalRevenue,
          totalOrders: records.length,
          avgOrderValue: records.length > 0 ? totalRevenue / records.length : 0,
          completedPayments
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleExport = () => {
    const exportData = orders.map(o => ({
      'Order ID': o.orderId,
      'Date': o.createdAt ? format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A',
      'Customer': o.customerName || o.user_name || 'Guest',
      'Amount': o.totalAmount || o.total_price,
      'Payment Method': o.payment_method,
      'Payment Status': o.paymentStatus,
      'Order Status': o.orderStatus
    }));
    exportToCSV(exportData, 'sales_report');
  };

  if (loading) return <div className="p-8">Loading report...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Helmet><title>Sales Report - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Sales Report</h1>
          <p className="text-muted-foreground">Comprehensive view of all transactions</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{metrics.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
              <h3 className="text-2xl font-bold">₹{Math.round(metrics.avgOrderValue).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><CreditCard className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid Orders</p>
              <h3 className="text-2xl font-bold">{metrics.completedPayments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-4">Order ID</TableHead>
                  <TableHead className="py-4">Date</TableHead>
                  <TableHead className="py-4">Customer</TableHead>
                  <TableHead className="py-4">Method</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="py-4 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 50).map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date((order.createdAt || order.created)), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{order.customerName || order.user_name || 'Guest'}</TableCell>
                    <TableCell className="uppercase text-xs font-medium">{(order.paymentMethod || order.payment_method) || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        (order.paymentStatus || order.paymentStatus) === 'paid' || (order.paymentStatus || order.paymentStatus) === 'completed' ? 'bg-green-100 text-green-800' :
                        (order.paymentStatus || order.paymentStatus) === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(order.paymentStatus || order.paymentStatus) || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{(order.totalAmount || order.total_price || 0).toLocaleString()}</TableCell>
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

export default SalesReportPage;
