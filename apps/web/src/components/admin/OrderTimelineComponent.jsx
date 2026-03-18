
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Package, Truck, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api.js';
import { Skeleton } from '@/components/ui/skeleton';

const OrderTimelineComponent = ({ orderId, createdAt }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const records = { items: [] }; // order_timeline not in new backend
        setTimeline(records.items);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchTimeline();
    }
  }, [orderId]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('placed') || s.includes('pending')) return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
    if (s.includes('process')) return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    if (s.includes('ship')) return { icon: Truck, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' };
    if (s.includes('deliver')) return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
    if (s.includes('cancel') || s.includes('fail')) return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
    return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no timeline records exist, show a default "Order Placed" entry
  const displayTimeline = timeline.length > 0 ? timeline : [
    {
      id: 'default',
      status: 'Order Placed',
      timestamp: createdAt || new Date().toISOString(),
      notes: 'Order received and pending processing.'
    }
  ];

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {displayTimeline.map((item, index) => {
        const config = getStatusConfig(item.status);
        const Icon = config.icon;
        
        return (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${config.bg} ${config.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                <h4 className="font-semibold text-foreground capitalize">{item.status.replace('_', ' ')}</h4>
                <time className="text-xs font-medium text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </time>
              </div>
              {item.notes && (
                <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimelineComponent;
