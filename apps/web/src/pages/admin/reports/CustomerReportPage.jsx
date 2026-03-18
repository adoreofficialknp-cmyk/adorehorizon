
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users, Star, Clock, ShieldAlert } from 'lucide-react';
import api from '@/lib/api.js';
import { exportToCSV } from '@/utils/exportUtils';
import { format } from 'date-fns';

const CustomerReportPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const usersRecord = await api.get('/auth/users?limit=1000').then(d => Array.isArray(d) ? d : d.items || []).catch(() => []);
        
        const ordersRecord = await api.get('/orders?limit=1000').then(d => Array.isArray(d) ? d : d.orders || d.items || []).catch(() => []);

        const enrichedCustomers = usersRecord.map(c => {
          const userOrders = ordersRecord.filter(o => o.user_id === c.id);
          const total_spent = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total_price || 0), 0);
          const last_order = userOrders.length > 0 
            ? userOrders.sort((a, b) => new Date(b.createdAt||b.created) - new Date(a.createdAt||a.created))[0].createdAt||[0].created 
            : c.createdAt || c.created;

          return {
            ...c,
            total_orders: userOrders.length,
            total_spent,
            last_order
          };
        }).sort((a, b) => b.total_spent - a.total_spent);

        setCustomers(enrichedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleExport = () => {
    const exportData = customers.map(c => ({
      'Name': c.name || 'N/A',
      'Email': c.email,
      'Phone': c.phone || 'N/A',
      'Total Orders': c.total_orders,
      'Total Spent': c.total_spent,
      'Last Order Date': c.last_order ? format(new Date(c.last_order), 'yyyy-MM-dd') : 'N/A'
    }));
    exportToCSV(exportData, 'customer_analytics_report');
  };

  if (loading) return <div className="p-8">Loading report...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Helmet><title>Customer Report - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Customer Insights</h1>
          <p className="text-muted-foreground">Analyze customer behavior and lifetime value</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">VIP Customers</p>
              <h3 className="text-2xl font-bold">{customers.filter(c => c.total_spent > 50000).length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Repeat Buyers</p>
              <h3 className="text-2xl font-bold">{customers.filter(c => c.total_orders > 1).length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Lifetime Value</p>
              <h3 className="text-2xl font-bold">₹{Math.round(customers.reduce((acc, c) => acc + c.total_spent, 0) / (customers.length || 1)).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">At Risk (90+ days)</p>
              <h3 className="text-2xl font-bold">{customers.filter(c => (Date.now() - new Date(c.last_order).getTime()) > 90 * 24 * 60 * 60 * 1000).length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Spending</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="py-4">Customer</TableHead>
                  <TableHead className="py-4">Contact</TableHead>
                  <TableHead className="py-4 text-right">Orders</TableHead>
                  <TableHead className="py-4 text-right">Total Spent</TableHead>
                  <TableHead className="py-4 text-right">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.slice(0, 20).map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{customer.total_orders}</TableCell>
                    <TableCell className="text-right text-primary font-bold">₹{customer.total_spent.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{customer.last_order ? format(new Date(customer.last_order), 'MMM dd, yyyy') : 'N/A'}</TableCell>
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

export default CustomerReportPage;
