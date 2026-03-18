
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminSupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let filter = [];
      if (searchTerm) filter.push(`(id ~ "${searchTerm}" || subject ~ "${searchTerm}")`);
      if (statusFilter !== 'all') filter.push(`status = "${statusFilter}"`);

      const result = { items: [], totalPages: 1 }; // support_tickets not in new backend

      setTickets(result.items);
      setTotalPages(result.totalPages);

      // Fetch stats (only on first load or refresh)
      if (page === 1 && !searchTerm && statusFilter === 'all') {
        const allTickets = []; // support_tickets not in new backend
        setStats({
          open: allTickets.filter(t => t.status === 'Open').length,
          inProgress: allTickets.filter(t => t.status === 'In Progress').length,
          resolved: allTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchTickets(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, statusFilter, page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Open</Badge>;
      case 'In Progress': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">In Progress</Badge>;
      case 'Resolved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Resolved</Badge>;
      case 'Closed': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'High': return <div className="w-2.5 h-2.5 rounded-full bg-red-500" title="High Priority" />;
      case 'Medium': return <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" title="Medium Priority" />;
      case 'Low': return <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="Low Priority" />;
      default: return <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet><title>Support Dashboard - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Support Helpdesk</h1>
          <p className="text-muted-foreground mt-1">Manage customer inquiries and support tickets</p>
        </div>
        <Button variant="outline" onClick={fetchTickets} disabled={loading} className="bg-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Open Tickets</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.open}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">In Progress</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Resolved</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.resolved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/10">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or Subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-3 w-3 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    No tickets found matching criteria
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin-portal-secure-access/support/${ticket.id}`}>
                    <TableCell>{getPriorityIndicator(ticket.priority)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">
                      {ticket.expand?.customer_id?.name || 'Unknown'}
                      <span className="block text-xs text-muted-foreground font-normal">{ticket.expand?.customer_id?.email || ticket.expand?.customer_id?.phone}</span>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate font-medium">{ticket.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ticket.category}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ticket.createdAt||ticket.created ? format(new Date(ticket.createdAt||ticket.created), 'MMM d, yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                        <Link to={`/admin-portal-secure-access/support/${ticket.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportDashboard;
