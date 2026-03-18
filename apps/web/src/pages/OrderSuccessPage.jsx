
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Package, ArrowRight } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderSuccessPage = () => {
  const { orderId: routeOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = routeOrderId || searchParams.get('order_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const record = await api.get(`/orders/${orderId}`);
        setOrder(record);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const generateInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.orderId}`, 14, 32);
    doc.text(`Date: ${new Date((order.createdAt || order.created)).toLocaleDateString()}`, 14, 38);
    
    doc.text('Billed To:', 14, 50);
    doc.text(order.customerName || 'Customer', 14, 56);
    doc.text((() => { const a = order.shippingAddress; return typeof a === 'object' ? Object.values(a).filter(Boolean).join(', ') : a || ''; })() || '', 14, 62);
    
    const tableData = (order.orderItems || order.items || []).map(item => [
      item.name,
      item.quantity.toString(),
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`
    ]) || [];

    doc.autoTable({
      startY: 75,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [198, 167, 105] }
    });

    const finalY = doc.lastAutoTable.finalY || 75;
    doc.text(`Subtotal: Rs. ${(order.subtotal || order.totalAmount || order.total_price || 0).toFixed(2)}`, 140, finalY + 10);
    doc.text(`Shipping: Rs. ${(order.shippingCost || order.shipping_cost || 0).toFixed(2) || '0.00'}`, 140, finalY + 16);
    if (order.discountAmount || order.discount_amount > 0) {
      doc.text(`Discount: -Rs. ${order.discountAmount || order.discount_amount.toFixed(2)}`, 140, finalY + 22);
    }
    doc.setFontSize(12);
    doc.text(`Total: Rs. ${(order.totalAmount || order.total_price || 0).toFixed(2)}`, 140, finalY + 30);

    doc.save(`Invoice_${order.orderId}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order <span className="font-medium text-foreground">{order.orderId}</span> has been received.
          </p>
        </div>

        <Card className="border-none shadow-lg mb-8 overflow-hidden">
          <div className="bg-muted/30 p-6 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Date</p>
                <p className="font-medium">{new Date((order.createdAt || order.created)).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Amount</p>
                <p className="font-medium">₹{(order.totalAmount || order.total_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Delivery Address</p>
                <p className="font-medium truncate" title={(() => { const a = order.shippingAddress; return typeof a === 'object' ? Object.values(a).filter(Boolean).join(', ') : a || ''; })()}>{(() => { const a = order.shippingAddress; return typeof a === 'object' ? Object.values(a).filter(Boolean).join(', ') : a || ''; })()}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.orderItems || order.items || []).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={generateInvoice} variant="outline" className="h-12 px-6">
            <Download className="w-4 h-4 mr-2" /> Download Invoice
          </Button>
          <Button asChild variant="secondary" className="h-12 px-6">
            <Link to={`/track-order/${order.id}`}>
              <Package className="w-4 h-4 mr-2" /> Track Order
            </Link>
          </Button>
          <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90">
            <Link to="/shop">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
