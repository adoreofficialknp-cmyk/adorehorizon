
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, 
  PackagePlus, ArrowRight, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, startOfDay } from 'date-fns';
import { trackPageLoad } from '@/utils/performanceMonitor';

const COLORS = ['#C6A769', '#1A1A1A', '#4A4A4A', '#8C8C8C', '#D9D9D9'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    aov: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);

  useEffect(() => {
    const endTracking = trackPageLoad('AdminDashboard');
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const thirtyDaysAgo = startOfDay(subDays(new Date(), 30)).toISOString();

        const orders = await api.get('/orders?limit=500').then(d => Array.isArray(d) ? d : d.orders || d.items || []);

        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || order.total_price || 0), 0);
        const totalOrders = orders.length;
        
        const uniqueCustomerIds = new Set(orders.map(o => o.user_id).filter(Boolean));
        const totalCustomers = uniqueCustomerIds.size;
        
        const aov = totalOrders > 0 ? totalSales / totalOrders : 0;

        setStats({ totalSales, totalOrders, totalCustomers, aov });
        setRecentOrders(orders.slice(0, 10));

        const dateMap = {};
        for (let i = 29; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'MMM dd');
          dateMap[d] = { name: d, orders: 0, revenue: 0 };
        }
        
        orders.forEach(order => {
          const d = format(new Date((order.createdAt || order.created)), 'MMM dd');
          if (dateMap[d]) {
            dateMap[d].orders += 1;
            dateMap[d].revenue += (order.totalAmount || order.total_price || 0);
          }
        });
        
        const chartDataArray = Object.values(dateMap);
        setSalesData(chartDataArray);
        setRevenueData(chartDataArray);

        const productCounts = {};
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const name = item.name || 'Unknown Product';
              productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
            });
          }
        });
        
        const calculatedTopProducts = Object.entries(productCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
          
        if (calculatedTopProducts.length === 0) {
          calculatedTopProducts.push({ name: 'No Sales Yet', count: 0 });
        }
        setTopProductsData(calculatedTopProducts);

        const paymentMethods = {};
        orders.forEach(order => {
          const method = (order.paymentMethod || order.payment_method) || 'Unknown';
          paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });
        
        const calculatedPaymentMethods = Object.entries(paymentMethods)
          .map(([name, value]) => ({ name: name.toUpperCase(), value }));
          
        if (calculatedPaymentMethods.length === 0) {
          calculatedPaymentMethods.push({ name: 'None', value: 1 });
        }
        setPaymentMethodData(calculatedPaymentMethods);

      } catch (err) {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
        endTracking();
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && salesData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Performance over the last 30 days.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Link to="/admin-portal-secure-access/analytics">
              <TrendingUp className="w-4 h-4 mr-2" /> Full Analytics
            </Link>
          </Button>
          <Button asChild className="bg-[#1A1A1A] text-white hover:bg-[#333333]">
            <Link to="/admin-portal-secure-access/products/new">
              <PackagePlus className="w-4 h-4 mr-2" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C6A769]/10 flex items-center justify-center text-[#C6A769]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A]">₹{stats.totalSales.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A]">{stats.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A]">{stats.totalCustomers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A]">₹{Math.round(stats.aov).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#C6A769" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Orders Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value, 'Orders']}
                  cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="orders" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value) => [value, 'Orders']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-[#C6A769] hover:text-[#C6A769]/80">
              <Link to="/admin-portal-secure-access/orders">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div>
                      <Link to={`/admin-portal-secure-access/orders/${order.id}`} className="font-medium text-sm hover:underline">{order.orderId || order.id.substring(0,8)}</Link>
                      <p className="text-xs text-muted-foreground">{order.customerName || order.user_name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">₹{(order.totalAmount || order.total_price || 0).toLocaleString()}</p>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${
                        (order.orderStatus || order.orderStatus) === 'delivered' ? 'bg-green-100 text-green-700' :
                        (order.orderStatus || order.orderStatus) === 'shipped' ? 'bg-orange-100 text-orange-700' :
                        (order.orderStatus || order.orderStatus) === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {((order.orderStatus || order.orderStatus) || 'Pending').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
