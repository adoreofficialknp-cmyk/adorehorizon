import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Save, Package, Truck, CreditCard, User, Calendar, Loader2 } from 'lucide-react';

const AdminOrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => { fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const record = await api.get('/orders/' + orderId);
      setOrder(record);
      setOrderStatus(record.orderStatus || 'order_placed');
      setPaymentStatus(record.paymentStatus || 'pending');
      setTrackingNumber(record.trackingNumber || '');
      setCourierName(record.courierName || '');
      if (record.estimatedDelivery) {
        setEstimatedDelivery(new Date(record.estimatedDelivery).toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend uses PUT /orders/:id/status with { orderStatus, paymentStatus }
      await api.put('/orders/' + order.id + '/status', {
        orderStatus,
        paymentStatus,
      });
      toast.success('Order updated successfully');
      fetchOrder();
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div><Skeleton className="h-[400px] w-full rounded-xl" /></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Button onClick={() => navigate('/admin-portal-secure-access/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const shippingAddr = typeof order.shippingAddress === 'object'
    ? Object.values(order.shippingAddress).filter(Boolean).join(', ')
    : order.shippingAddress || '—';

  const orderItems = order.orderItems || (Array.isArray(order.items) ? order.items : []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link to="/admin-portal-secure-access/orders"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] flex items-center gap-3">
              Order {order.orderId}
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {(order.orderStatus || '').replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#1A1A1A] hover:bg-[#333333] text-white min-w-[120px]">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium text-muted-foreground w-20 inline-block">Name:</span> {order.customerName}</p>
                <p><span className="font-medium text-muted-foreground w-20 inline-block">Email:</span> {order.customerEmail}</p>
                <p><span className="font-medium text-muted-foreground w-20 inline-block">Phone:</span> {order.customerPhone}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="leading-relaxed">{shippingAddr}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t">
                {orderItems.length > 0 ? orderItems.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">₹{item.price?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right font-bold text-sm w-24">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-muted-foreground">No items data available</div>
                )}
              </div>
              <div className="bg-muted/20 p-6 border-t space-y-2">
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium w-24 text-right">₹{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium w-24 text-right">₹{(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-end gap-8 text-sm text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium w-24 text-right">-₹{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-end gap-8 text-lg font-bold pt-2 border-t mt-2">
                  <span>Total:</span>
                  <span className="text-primary w-24 text-right">₹{(order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Status Management</CardTitle>
              <CardDescription>Update the current state of this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_placed">Order Placed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select payment status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" /> Payment Details
                </p>
                <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-1.5 font-mono">
                  <p><span className="text-muted-foreground">Method:</span> {order.paymentMethod || 'N/A'}</p>
                  {order.razorpayPaymentId && <p className="truncate"><span className="text-muted-foreground">RZP ID:</span> {order.razorpayPaymentId}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderStatusPage;
