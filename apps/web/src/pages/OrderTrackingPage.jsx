
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO.jsx';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const record = await api.get(`/orders/${orderId}`);
        setOrder(record);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Order not found. Please check your order ID and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <Skeleton className="h-10 w-64 mb-8" />
          <Card className="border-none shadow-md rounded-2xl mb-8">
            <CardContent className="p-8">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-4">Tracking Unavailable</h1>
          <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/profile">Go to My Orders</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = [
    { id: 'order_placed', label: 'Order Placed', icon: Package, description: 'We have received your order' },
    { id: 'processing', label: 'Processing', icon: Clock, description: 'Your order is being prepared' },
    { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Your order has been delivered' }
  ];

  const getStepIndex = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing') return 1;
    if (s === 'cancelled') return -1;
    return 0;
  };

  const currentStepIndex = getStepIndex((order.orderStatus || (order.orderStatus || order.order_status)));
  const isCancelled = currentStepIndex === -1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title={`Track Order ${order.orderId} - ADORE Jewellery`}
        description="Track your ADORE Jewellery order in real-time. Get updates on shipping and delivery."
        robots="noindex, follow"
        url={`/track-order/${orderId}`}
      />
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-[#1A1A1A]">
            <Link to="/profile"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
          </Button>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">Order #{order.orderId}</p>
        </div>

        {isCancelled ? (
          <Card className="border-none shadow-md rounded-2xl bg-red-50 mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Order Cancelled</h2>
              <p className="text-red-600">This order has been cancelled. If you have any questions, please contact support.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-md rounded-2xl mb-8 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <h2 className="text-lg font-serif font-semibold">Order Status</h2>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative">
                <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full hidden sm:block">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 relative">
                        {index < steps.length - 1 && (
                          <div className={`absolute left-6 top-12 bottom-[-2rem] w-0.5 sm:hidden ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                        )}
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-300 z-10 ${
                          isCompleted 
                            ? 'bg-primary border-primary/20 text-primary-foreground' 
                            : 'bg-white border-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div>
                          <h4 className={`font-bold text-base ${isCompleted ? 'text-[#1A1A1A]' : 'text-muted-foreground'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[120px] hidden sm:block mx-auto">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Shipping Information
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {order.tracking_number ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                    <p className="font-bold text-lg text-[#1A1A1A]">{order.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Courier Partner</p>
                    <p className="font-medium text-[#1A1A1A]">{order.courier_name || 'Standard Shipping'}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Tracking information will be available once your order ships.</p>
                </div>
              )}
              
              {order.estimated_delivery_date && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                  <p className="font-medium text-primary">
                    {new Date(order.estimated_delivery_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Address
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-medium text-[#1A1A1A] mb-1">{order.customerName || order.user_name}</p>
              <p className="text-muted-foreground leading-relaxed mb-3">{(() => { const a = order.shippingAddress || order.shipping_address; return typeof a === 'object' ? Object.values(a||{}).filter(Boolean).join(', ') : a || ''; })()}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="font-medium">Phone:</span> {order.shipping_phone}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <h2 className="text-lg font-serif font-semibold">Items in this shipment</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y border-border/50">
              {order.items && Array.isArray(order.items) && order.items.map((item, index) => (
                <div key={index} className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#1A1A1A] truncate">{item.name || 'Product'}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
