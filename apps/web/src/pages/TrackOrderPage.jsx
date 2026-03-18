
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Package, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api.js';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);

    try {
      const order = await api.get(`/orders/${orderId}`);
      const orders = order ? [order] : [];

      if (orders.length === 0) {
        toast.error('Order not found');
        setOrder(null);
      } else {
        setOrder(orders[0]);
      }
    } catch (error) {
      toast.error('Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Package,
      confirmed: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: Package
    };
    return icons[status] || Package;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-700',
      confirmed: 'bg-blue-500/10 text-blue-700',
      shipped: 'bg-purple-500/10 text-purple-700',
      delivered: 'bg-green-500/10 text-green-700',
      cancelled: 'bg-red-500/10 text-red-700'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700';
  };

  return (
    <>
      <Helmet>
        <title>Track Order - ADORE Jewellery</title>
        <meta name="description" content="Track your ADORE Jewellery order status" />
      </Helmet>

      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 
          className="text-3xl md:text-4xl font-bold mb-8 text-center"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Track your order
        </h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="Enter your order ID (e.g., ORD-1234567890)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="flex-1 text-foreground"
                  />
                  <Button type="submit" disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Tracking...' : 'Track'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.orderId}</CardTitle>
                <Badge className={getStatusColor((order.orderStatus || (order.orderStatus || order.order_status)))}>
                  {(order.orderStatus || (order.orderStatus || order.order_status))}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-medium text-primary">
                    ₹{(order.totalAmount || order.total_price || 0).toLocaleString()}
                  </p>
                </div>
                {order.tracking_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                    <p className="font-medium">{order.tracking_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                  <Badge variant="outline">{(order.paymentStatus || (order.paymentStatus || order.payment_status))}</Badge>
                </div>
              </div>

              {(order.shippingAddress || order.shipping_address) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                  <p className="font-medium">{(order.shippingAddress || order.shipping_address)}</p>
                  {order.shipping_phone && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {order.shipping_phone}
                    </p>
                  )}
                </div>
              )}

              {order.tracking_status && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tracking Status</p>
                  <p className="text-sm">{order.tracking_status}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </>
  );
};

export default TrackOrderPage;
