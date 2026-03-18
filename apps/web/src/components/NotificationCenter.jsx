
import React, { useState, useEffect, useContext } from 'react';
import { Bell, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api.js';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const records = { items: [] }; // notifications not in new backend
      setNotifications(records.items);
      setUnreadCount(records.items.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!currentUser) return;

    // Subscribe to real-time updates
    // realtime not available; if (false) pb.collection('notifications').subscribe('*', function (e) {
      if (e.action === 'create' && e.record.user_id === currentUser.id) {
        setNotifications(prev => [e.record, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      // pb.collection('notifications').unsubscribe('*');
    };
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
      // notifications not in new backend
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        Promise.resolve() // notifications not in new backend
      ));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (!currentUser) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative text-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-destructive text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:text-primary/80 hover:bg-transparent">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="p-8 flex justify-center items-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-2">Could not load notifications</p>
              <p className="text-xs opacity-80 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchNotifications}>
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Bell className="h-8 w-8 mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
                      <span className="text-[10px] text-muted-foreground/70">
                        {(notification.createdAt || notification.created || notification.timestamp) ? formatDistanceToNow(new Date(notification.createdAt || notification.created || notification.timestamp), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                  </div>
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
