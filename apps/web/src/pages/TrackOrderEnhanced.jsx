
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Package, CreditCard, Settings, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api.js';
import { format, addDays } from 'date-fns';

const TrackOrderEnhanced = () => {
  const { trackingId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const record = await api.get(`/orders/${trackingId}`);
        if (!record) throw new Error('Order not found');
        setOrder(record);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [trackingId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20">
          <Skeleton className="h-12 w-64 mx-auto mb-12" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Tracking Information Not Found</h1>
          <p className="text-muted-foreground mb-8">Please check your tracking number and try again.</p>
          <Link to="/track-order">
            <Button>Track Another Order</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const statuses = [
    { id: 'pending', label: 'Order Placed', icon: Package, description: 'We have received your order' },
    { id: 'paid', label: 'Payment Confirmed', icon: CreditCard, description: 'Payment has been verified' },
    { id: 'processing', label: 'Processing', icon: Settings, description: 'Your items are being prepared' },
    { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Order is on the way' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order has been delivered' }
  ];

  // Determine current step index
  let currentStepIndex = 0;
  const currentStatus = (order.orderStatus || order.order_status);
  
  if (currentStatus === 'cancelled') {
    currentStepIndex = -1; // Special case
  } else {
    const index = statuses.findIndex(s => s.id === currentStatus);
    if (index !== -1) currentStepIndex = index;
    // Handle intermediate statuses
    if (currentStatus === 'payment_pending') currentStepIndex = 0;
  }

  const estimatedDelivery = addDays(new Date((order.createdAt || order.created)), 5);
  
  let carrierName = 'Standard Shipping';
  if (order.carrier_info) {
    try {
      const parsed = typeof order.carrier_info === 'string' ? JSON.parse(order.carrier_info) : order.carrier_info;
      if (parsed.carrier) carrierName = parsed.carrier;
    } catch (e) {
      carrierName = order.carrier_info;
    }
  }

  return (
    <>
      <Helmet>
        <title>Track Order {trackingId} - ADORE</title>
      </Helmet>
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Order #{order.orderId}
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-10">
            {currentStatus === 'cancelled' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">Order Cancelled</h2>
                <p className="text-muted-foreground">This order has been cancelled and refunded.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[hsl(var(--timeline-inactive))] -translate-x-1/2 hidden md:block" />
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[hsl(var(--timeline-inactive))] md:hidden" />

                <div className="space-y-12 relative">
                  {statuses.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                        
                        {/* Left side (Date/Time) - Desktop only */}
                        <div className="hidden md:block md:w-1/2 text-right pr-12">
                          {isCompleted && (
                            <>
                              <p className="font-medium text-foreground">
                                {index === 0 ? format(new Date((order.createdAt || order.created)), 'MMM dd, yyyy') : 
                                 index === currentStepIndex ? order.updatedAt ? format(new Date(order.updatedAt), 'MMM dd, yyyy') : '' : ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {index === 0 ? format(new Date((order.createdAt || order.created)), 'p') : 
                                 index === currentStepIndex ? order.updatedAt ? format(new Date(order.updatedAt), 'p') : '' : ''}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background z-10 transition-colors duration-300 ${
                            isActive ? 'bg-[hsl(var(--timeline-active))] text-primary-foreground shadow-lg shadow-primary/20' : 
                            isCompleted ? 'bg-[hsl(var(--timeline-active))] text-primary-foreground' : 
                            'bg-[hsl(var(--timeline-inactive))] text-muted-foreground'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Right side (Content) */}
                        <div className="pl-20 md:pl-12 md:w-1/2">
                          <h3 className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                            {step.label}
                          </h3>
                          <p className="text-muted-foreground mt-1">{step.description}</p>
                          
                          {/* Mobile Date/Time */}
                          {isCompleted && (
                            <p className="text-sm text-muted-foreground mt-2 md:hidden">
                              {index === 0 ? format(new Date((order.createdAt || order.created)), 'MMM dd, yyyy • p') : 
                               index === currentStepIndex ? order.updatedAt ? format(new Date(order.updatedAt), 'MMM dd, yyyy • p') : '' : ''}
                            </p>
                          )}

                          {/* Extra Info for specific steps */}
                          {step.id === 'shipped' && isCompleted && order.tracking_id && (
                            <div className="mt-3 bg-muted/50 p-3 rounded-lg border border-border inline-block">
                              <p className="text-sm"><span className="font-medium">Carrier:</span> {carrierName}</p>
                              <p className="text-sm"><span className="font-medium">Tracking #:</span> {order.tracking_id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-primary mb-2">Estimated Delivery</h3>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              {format(estimatedDelivery, 'EEEE, MMMM do')}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default TrackOrderEnhanced;
