
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Package, Truck, CreditCard, User, Calendar, MapPin, Edit } from 'lucide-react';
import OrderTimelineComponent from '@/components/admin/OrderTimelineComponent';
import OrderStatusUpdateModal from '@/components/admin/OrderStatusUpdateModal';

const AdminOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      let record;
      try {
        record = await api.get(`/orders/${orderId}`);
      } catch (e) {
        // fallback already handled above
      }
      setOrder(record);
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'order_placed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cod': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet>
        <title>Order {order.orderId || order.orderId} - Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link to="/admin-portal-secure-access/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] flex items-center gap-3">
              Order #{order.orderId || order.orderId}
              <Badge variant="secondary" className={`${getStatusColor(order.orderStatus || order.orderStatus)} border-none capitalize`}>
                {(order.orderStatus || order.orderStatus || 'pending').replace('_', ' ')}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(order.createdAt || (order.createdAt || order.created)).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>Print Order</Button>
          <Button onClick={() => setIsUpdateModalOpen(true)} className="bg-primary text-primary-foreground">
            <Edit className="w-4 h-4 mr-2" /> Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-medium">{order.customerName || order.user_name || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{order.customerEmail || order.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{order.customerPhone || order.shipping_phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="leading-relaxed">{(() => { const a = order.shippingAddress || order.shipping_address; return typeof a === 'object' ? Object.values(a||{}).filter(Boolean).join(', ') : a || ''; })()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.orderItems || order.items || []).length > 0 ? (order.orderItems || order.items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No items found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <div className="bg-muted/20 p-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{((order.subtotal || order.totalAmount || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{`₹${(order.shippingCost || order.shipping_cost || 0).toLocaleString()}`}</span>
                </div>
                {(order.discountAmount || order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{(order.discountAmount || order.discount_amount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t mt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{(order.totalAmount || order.total_price || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Timeline */}
        <div className="space-y-6">
          
          {/* Payment Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={`${getPaymentStatusColor(order.paymentStatus || (order.paymentStatus || order.payment_status))} border-none capitalize`}>
                  {order.paymentStatus || (order.paymentStatus || order.payment_status) || 'pending'}
                </Badge>
              </div>
              {order.razorpay_payment_id && (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-muted-foreground text-xs block mb-1">Transaction ID</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">{order.razorpay_payment_id}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {(order.tracking_number || order.orderStatus || order.orderStatus === 'shipped') && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Courier</span>
                  <span className="font-medium">{order.courier_name || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Tracking Number</span>
                  <span className="font-mono font-medium">{order.tracking_number || 'Not specified'}</span>
                </div>
                {order.estimated_delivery_date && (
                  <div>
                    <span className="text-muted-foreground text-xs block">Est. Delivery</span>
                    <span className="font-medium">{new Date(order.estimated_delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-serif">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimelineComponent orderId={order.id} createdAt={order.createdAt || (order.createdAt || order.created)} />
            </CardContent>
          </Card>

        </div>
      </div>

      <OrderStatusUpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        order={order} 
        onSuccess={fetchOrder} 
      />
    </div>
  );
};

export default AdminOrderDetailsPage;
