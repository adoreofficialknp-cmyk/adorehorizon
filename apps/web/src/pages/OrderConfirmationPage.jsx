
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Truck, MapPin, CreditCard, Download, ArrowRight, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api.js';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SEO from '@/components/SEO.jsx';
import { trackPurchase } from '@/utils/analytics';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const record = await api.get(`/orders/${orderId}`);
        if (!record) throw new Error('Order not found');
        setOrder(record);
        
        // Track purchase event once
        if (!hasTracked && record) {
          trackPurchase(
            record.orderId || record.id,
            record.totalAmount || record.total_price || 0,
            record.orderItems || record.items || [],
            0, // shipping
            0  // tax
          );
          setHasTracked(true);
        }
        
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('We could not find your order details. Please check your order ID or contact support.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, hasTracked]);

  const handleDownloadInvoice = () => {
    if (!order) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(26, 26, 26);
      doc.text('INVOICE', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('ADORE Jewellery', 14, 30);
      doc.text('support@adorejewellery.com', 14, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.text(`Order ID: ${order.orderId || order.id}`, 120, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${new Date((order.createdAt || order.created)).toLocaleDateString()}`, 120, 30);
      doc.text(`Payment: ${(order.paymentMethod || (order.paymentMethod || order.payment_method)) === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 120, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.text('Bill To:', 14, 50);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text((order.customerName || order.user_name || 'Customer', 14, 57);
      doc.text((order.customerEmail || (order.customerEmail || order.customer_email)) || order.user_email || '', 14, 62);
      doc.text((order.customerPhone || (order.customerPhone || order.customer_phone)) || order.shipping_phone || '', 14, 67);
      
      const addressLines = doc.splitTextToSize(order.shipping_address || 'N/A', 80);
      doc.text(addressLines, 14, 72);
      
      const items = order.items || order.order_items || [];
      const tableData = items.map(item => [
        item.name || item.product_name || 'Product',
        item.quantity || 1,
        `Rs. ${(item.price || 0).toLocaleString()}`,
        `Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
      ]);
      
      doc.autoTable({
        startY: 90,
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [198, 167, 105], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      
      const finalY = doc.lastAutoTable.finalY || 90;
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.text(`Total Amount: Rs. ${(order.totalAmount || order.total_price || 0).toLocaleString()}`, 140, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for shopping with ADORE Jewellery!', 105, 280, { align: 'center' });
      
      doc.save(`Invoice_${order.orderId || order.id}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Loading order details...</p>
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
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center border-none shadow-lg">
            <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/profile">My Orders</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isCOD = (order.paymentMethod || (order.paymentMethod || order.payment_method)) === 'cod';
  const items = order.items || order.order_items || [];
  const totalAmount = order.totalAmount || order.total_price || 0;
  const displayOrderId = order.orderId || order.id;

  const orderDate = new Date((order.createdAt || order.created));
  const estDeliveryDate = new Date(orderDate);
  estDeliveryDate.setDate(estDeliveryDate.getDate() + 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Order Confirmed - ADORE Jewellery"
        description="Your order has been confirmed. Track your shipment and manage your order."
        robots="noindex, follow"
        url={`/order-confirmation/${orderId}`}
      />
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-sm ring-8 ring-green-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A1A] mb-3">
            Thank you for your order!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isCOD 
              ? 'Your order has been placed successfully. Payment will be collected when your order is delivered.' 
              : 'Your payment was successful and your order is now being processed.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" /> Order Details
                  </h2>
                  <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full w-fit">
                    {(order.orderStatus || (order.orderStatus || order.order_status)) || 'Order Placed'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm border-b">
                  <div>
                    <p className="text-muted-foreground mb-1">Order ID</p>
                    <p className="font-medium text-[#1A1A1A]">{displayOrderId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-[#1A1A1A]">{orderDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Payment</p>
                    <p className="font-medium text-[#1A1A1A] uppercase">{isCOD ? 'COD' : 'PAID'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Total</p>
                    <p className="font-medium text-primary">₹{totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-medium text-[#1A1A1A] mb-4">Items Ordered</h3>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="w-5 h-5 opacity-50" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#1A1A1A]">{item.name || item.product_name || 'Product'}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <p className="font-medium text-sm">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-[#1A1A1A] pt-2">
                      <span>Total</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <h2 className="text-base font-serif font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" /> Delivery Info
                </h2>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1">Estimated Delivery</p>
                  <p className="font-medium text-[#1A1A1A]">{estDeliveryDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </p>
                  <p className="font-medium text-[#1A1A1A]">{(order.customerName || order.user_name}</p>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {order.shipping_address || 'Address not provided'}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {(order.customerPhone || (order.customerPhone || order.customer_phone)) || order.shipping_phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-primary/5">
              <CardContent className="p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment Method
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isCOD 
                    ? 'Cash on Delivery. Please keep exact change ready.' 
                    : 'Paid securely via online payment.'}
                </p>
                <Button variant="outline" className="w-full bg-white" onClick={handleDownloadInvoice}>
                  <Download className="w-4 h-4 mr-2" /> Download Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link to="/shop">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link to={`/track-order/${displayOrderId}`}>
              Track Order
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
