import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const STATUS_HIERARCHY = {
  pending: 0, payment_pending: 1, order_placed: 2,
  processing: 3, shipped: 4, delivered: 5, cancelled: -1,
};

const OrderStatusUpdateModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('order');
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || 'order_placed');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'pending');

  const handleUpdateOrderStatus = async () => {
    const currentLevel = STATUS_HIERARCHY[order?.orderStatus] ?? 0;
    const newLevel = STATUS_HIERARCHY[orderStatus] ?? 0;
    if (newLevel !== -1 && newLevel < currentLevel) {
      toast.error('Cannot move order status backwards.');
      return;
    }

    setLoading(true);
    try {
      // Correct endpoint: PUT /orders/:id/status
      await api.put('/orders/' + order.id + '/status', { orderStatus });
      toast.success('Order status updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    setLoading(true);
    try {
      // Correct endpoint: PUT /orders/:id/status
      await api.put('/orders/' + order.id + '/status', { paymentStatus });
      toast.success('Payment status updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Order #{order?.orderId}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order">Order Status</TabsTrigger>
            <TabsTrigger value="payment">Payment Status</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>New Order Status</Label>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_placed">Order Placed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleUpdateOrderStatus} disabled={loading || orderStatus === order?.orderStatus}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Order Status'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-start gap-3 text-sm mb-4 border border-yellow-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Changing payment status manually bypasses gateway verification. Only do this if you have confirmed the payment externally.</p>
            </div>
            <div className="space-y-2">
              <Label>New Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger><SelectValue placeholder="Select payment status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleUpdatePaymentStatus} disabled={loading || paymentStatus === order?.paymentStatus}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Payment Status'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusUpdateModal;
