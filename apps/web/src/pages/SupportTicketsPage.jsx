
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { MessageSquare, Plus, Search, Clock, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactFormModal from '@/components/ContactFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const SupportTicketsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { fetchCustomerTickets, loading } = useSupportTickets();
  
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTickets = async () => {
    if (!currentUser) return;
    const result = await fetchCustomerTickets(currentUser.id, page, statusFilter);
    setTickets(result.items || []);
    setTotalPages(result.totalPages || 1);
  };

  useEffect(() => {
    loadTickets();
  }, [currentUser, page, statusFilter]);

  // Refresh tickets when modal closes (in case a new ticket was created)
  useEffect(() => {
    if (!isModalOpen) {
      loadTickets();
    }
  }, [isModalOpen]);

  const filteredTickets = tickets.filter(ticket => 
    searchQuery === '' || 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Open</Badge>;
      case 'In Progress': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">In Progress</Badge>;
      case 'Resolved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Resolved</Badge>;
      case 'Closed': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">High</span>;
      case 'Medium': return <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">Medium</span>;
      case 'Low': return <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">Low</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>My Support Tickets - ADORE Jewellery</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Support Tickets</h1>
            <p className="text-muted-foreground mt-1">View and manage your support requests</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tickets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
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
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="w-[100px]">Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                        <p>No support tickets found.</p>
                        {statusFilter !== 'all' || searchQuery !== '' ? (
                          <Button variant="link" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }} className="mt-2">
                            Clear filters
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="mt-4">
                            Create your first ticket
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => window.location.href = `/support-tickets/${ticket.id}`}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium text-foreground max-w-[300px] truncate">
                        <Link to={`/support-tickets/${ticket.id}`} className="hover:underline">
                          {ticket.subject}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.category}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {ticket.createdAt||ticket.created ? format(new Date(ticket.createdAt||ticket.created), 'MMM d, yyyy') : 'N/A'}
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
      </main>
      
      <Footer />
      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SupportTicketsPage;
