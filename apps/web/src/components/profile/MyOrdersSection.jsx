
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MyOrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const records = await api.get('/orders/my').then(d => Array.isArray(d) ? d : d.orders || d.items || []);
        setOrders(records);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl border border-border">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-xl font-serif font-medium mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
        <Button asChild>
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold mb-6">My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-muted/50 p-4 border-b border-border flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date((order.createdAt || order.created)).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium">₹{(order.totalAmount || order.total_price || 0).toLocaleString()}</p>
            </div>
            <div>
              <Badge variant="outline" className="capitalize">
                {(order.orderStatus || order.order_status)?.replace('_', ' ')}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/track-order/${order.id}`}>
                Track Order <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                    {item.image && (
                      <img 
                        src={item.image || ''} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrdersSection;
