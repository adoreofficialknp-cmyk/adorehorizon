
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { Search, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api.js';

const AdminOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let filterStr = '';
      if (statusFilter !== 'all') {
        filterStr = `order_status = "${statusFilter}"`;
      }

      const result = await api.get('/orders?page=1&limit=50').then(d => ({ items: Array.isArray(d) ? d.orders || d : d.orders || d.items || [], totalPages: d.totalPages || 1 }));
      setOrders(result.items);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderId || order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.expand?.user_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
      payment_pending: 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20',
      paid: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
      processing: 'bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20',
      shipped: 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20',
      delivered: 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
      cancelled: 'bg-red-500/10 text-red-700 hover:bg-red-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700';
  };

  return (
    <>
      <Helmet>
        <title>Admin Orders - ADORE Jewellery</title>
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Order Management
            </h1>
            <p className="text-muted-foreground mt-1">View and manage customer orders</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID or Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderId || order.orderId}</TableCell>
                        <TableCell>{format(new Date(order.createdAt || (order.createdAt || order.created)), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{order.expand?.user_id?.name || order.user_email || 'Guest'}</TableCell>
                        <TableCell>₹{order.final_amount?.toLocaleString() || order.total_price?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(order.orderStatus || order.orderStatus)}>
                            {order.orderStatus || order.orderStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            order.paymentStatus || (order.paymentStatus || order.payment_status) === 'completed' ? 'border-green-500 text-green-600' : 
                            order.paymentStatus || (order.paymentStatus || order.payment_status) === 'failed' ? 'border-red-500 text-red-600' : ''
                          }>
                            {order.paymentStatus || (order.paymentStatus || order.payment_status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default AdminOrderDashboard;
