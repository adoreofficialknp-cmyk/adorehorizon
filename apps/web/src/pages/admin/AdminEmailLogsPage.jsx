
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { 
  Mail, Search, Filter, RefreshCw, CheckCircle2, XCircle, Clock, 
  Eye, Send, Trash2, AlertCircle, Download
} from 'lucide-react';
import api from '@/lib/api.js';
import apiServerClient from '@/lib/apiServerClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminEmailLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = { items: [], totalPages: 1 }; // email_logs not in new backend
      
      setLogs(records.items);
      
      // Calculate stats
      const total = records.items.length;
      const sent = records.items.filter(l => l.status === 'sent').length;
      const failed = records.items.filter(l => l.status === 'failed').length;
      const pending = records.items.filter(l => l.status === 'pending').length;
      
      setStats({ total, sent, failed, pending });
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResend = async (logId) => {
    setResendingId(logId);
    try {
      const res = await apiServerClient.fetch('/email/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      
      if (!res.ok) throw new Error('Failed to resend');
      
      toast.success('Email queued for resending');
      fetchLogs();
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    
    try {
      // await pb.collection('email_logs').delete(logId);
      toast.success('Log deleted successfully');
      setLogs(logs.filter(l => l.id !== logId));
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete log');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.email_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Sent</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet><title>Email Logs - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Email Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage system email notifications</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading} className="bg-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sent</p>
              <p className="text-xl font-bold">{stats.sent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-xl font-bold">{stats.failed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by email, order ID, or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Email Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                  <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                  <SelectItem value="shipping_notification">Shipping Notification</SelectItem>
                  <SelectItem value="delivery_confirmation">Delivery Confirmation</SelectItem>
                  <SelectItem value="admin_new_order">Admin Alert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No email logs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{log.recipient_email}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-muted px-2 py-1 rounded-md capitalize">
                        {log.email_type?.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={log.subject}>
                      {log.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.createdAt||log.created ? format(new Date(log.createdAt||log.created), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setSelectedLog(log); setIsDetailsOpen(true); }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {log.status === 'failed' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleResend(log.id)}
                          disabled={resendingId === log.id}
                          title="Resend Email"
                        >
                          <Send className={`w-4 h-4 ${resendingId === log.id ? 'animate-pulse' : ''}`} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              Email Details {selectedLog && getStatusBadge(selectedLog.status)}
            </DialogTitle>
            <DialogDescription>
              Log ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Recipient</p>
                  <p className="font-medium">{selectedLog.recipient_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email Type</p>
                  <p className="font-medium capitalize">{selectedLog.email_type?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Order ID</p>
                  <p className="font-medium">{selectedLog.order_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Sent At</p>
                  <p className="font-medium">
                    {selectedLog.sent_at ? format(new Date(selectedLog.sent_at), 'PPpp') : 'Not sent'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Subject</p>
                <div className="p-3 bg-muted/50 rounded-lg border border-border font-medium">
                  {selectedLog.subject}
                </div>
              </div>

              {selectedLog.status === 'failed' && selectedLog.error_message && (
                <div>
                  <p className="text-red-600 text-sm font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Error Message
                  </p>
                  <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-100 font-mono text-xs whitespace-pre-wrap">
                    {selectedLog.error_message}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Retry count: {selectedLog.retry_count || 0}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => handleDelete(selectedLog.id)} className="text-destructive hover:bg-destructive/10 border-destructive/20">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Log
                </Button>
                {selectedLog.status === 'failed' && (
                  <Button onClick={() => handleResend(selectedLog.id)} disabled={resendingId === selectedLog.id}>
                    <Send className={`w-4 h-4 mr-2 ${resendingId === selectedLog.id ? 'animate-pulse' : ''}`} /> 
                    {resendingId === selectedLog.id ? 'Resending...' : 'Resend Email'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailLogsPage;
