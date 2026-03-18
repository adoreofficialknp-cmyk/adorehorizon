
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, CreditCard, CheckCircle2, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Failed to parse notifications');
      }
    }
  }, []);

  // Save to local storage when updated
  useEffect(() => {
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Subscribe to real-time order updates
  useEffect(() => {
    const subscribeToOrders = async () => {
      try {
        // realtime not available — pb.collection('orders').subscribe('*', function (e) {
          const order = e.record;
          
          if (e.action === 'create') {
            const newNotif = {
              id: `notif_${Date.now()}`,
              type: 'new_order',
              title: 'New Order Placed',
              message: `Order #${order.orderId} for ₹${order.totalAmount || order.total_price || 0}`,
              link: `/admin-portal-secure-access/orders/${order.id}`,
              timestamp: new Date().toISOString(),
              read: false
            };
            
            setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
            toast.success(`New order placed: ${order.orderId}`, { icon: <Package className="w-4 h-4" /> });
          } 
          else if (e.action === 'update') {
            // Check if payment status changed to paid
            if ((order.paymentStatus || order.payment_status) === 'paid') {
              // We don't have previous state easily, so we might get duplicates if updated multiple times.
              // In a real app, we'd check if it was previously unpaid.
              const newNotif = {
                id: `notif_pay_${Date.now()}`,
                type: 'payment',
                title: 'Payment Received',
                message: `Payment confirmed for Order #${order.orderId}`,
                link: `/admin-portal-secure-access/orders/${order.id}`,
                timestamp: new Date().toISOString(),
                read: false
              };
              setNotifications(prev => [newNotif, ...prev].slice(0, 50));
              toast.success(`Payment received for order ${order.orderId}`, { icon: <CreditCard className="w-4 h-4" /> });
            }
          }
        });
      } catch (err) {
        console.error('Failed to subscribe to orders:', err);
      }
    };

    subscribeToOrders();

    return () => {
      // pb.collection('orders').unsubscribe('*');
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_order': return <Package className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl rounded-xl border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto px-2 py-1 text-xs text-primary">
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive">
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 flex gap-3 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={notif.link} onClick={() => setIsOpen(false)} className="block">
                      <p className={`text-sm font-medium truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Link>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
