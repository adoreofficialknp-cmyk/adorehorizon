
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Users, Eye, MousePointerClick, Clock, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import api from '@/lib/api.js';

const COLORS = ['#C6A769', '#1A1A1A', '#4A4A4A', '#8C8C8C', '#D9D9D9'];

const AdminAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for GA4 metrics since we don't have a direct backend integration yet
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    pageViews: 0,
    bounceRate: 0,
    avgSessionDuration: 0
  });
  
  const [pageViewsData, setPageViewsData] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real implementation, this would fetch from your backend API that connects to GA4
      // For now, we'll generate realistic mock data to demonstrate the UI
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 5000) + 10000,
        bounceRate: (Math.random() * 20 + 30).toFixed(1),
        avgSessionDuration: Math.floor(Math.random() * 120) + 60
      });

      // Generate last 7 days data
      const pvData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        pvData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          views: Math.floor(Math.random() * 1000) + 500,
          visitors: Math.floor(Math.random() * 300) + 100
        });
      }
      setPageViewsData(pvData);

      setTrafficSources([
        { name: 'Organic Search', value: 45 },
        { name: 'Direct', value: 30 },
        { name: 'Social', value: 15 },
        { name: 'Referral', value: 10 }
      ]);

      setDeviceData([
        { name: 'Mobile', value: 65 },
        { name: 'Desktop', value: 30 },
        { name: 'Tablet', value: 5 }
      ]);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading && pageViewsData.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Analytics Error</h2>
        <p className="text-muted-foreground max-w-md mb-6">{error}</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <Helmet><title>Web Analytics - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Web Analytics</h1>
          <p className="text-muted-foreground mt-1">Traffic and engagement metrics (GA4 Integration)</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={loading} className="bg-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Users (Now)</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{metrics.activeUsers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Page Views (7d)</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{metrics.pageViews.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <MousePointerClick className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bounce Rate</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{metrics.bounceRate}%</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Session</p>
              <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{formatDuration(metrics.avgSessionDuration)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Traffic Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" name="Page Views" stroke="#C6A769" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#1A1A1A" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Devices</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
