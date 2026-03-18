
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Paperclip, Send, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminSupportTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTicketDetails, addReply, updateTicketStatus, loading } = useSupportTickets();
  
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTicketDetails(id);
        setTicket(data.ticket);
        setReplies(data.replies);
        scrollToBottom();
      } catch (error) {
        toast.error('Ticket not found');
        navigate('/admin-portal-secure-access/support');
      }
    };
    loadData();
  }, [id, fetchTicketDetails, navigate]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && !replyFile) return;
    
    setIsSubmitting(true);
    try {
      const customerEmail = ticket.expand?.customer_id?.email;
      const newReply = null; // support_tickets not in new backend
      
      // Update local state
      setReplies([...replies, newReply]);
      setTicket({ ...ticket, status: 'In Progress' });
      setReplyMessage('');
      setReplyFile(null);
      scrollToBottom();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const customerEmail = ticket.expand?.customer_id?.email;
      const updated = await updateTicketStatus(id, newStatus, customerEmail);
      setTicket(updated);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Open</Badge>;
      case 'In Progress': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">In Progress</Badge>;
      case 'Resolved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Resolved</Badge>;
      case 'Closed': return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && !ticket) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) return null;

  const customer = ticket.expand?.customer_id;
  const customerInitials = customer?.name ? customer.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'C';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 h-[calc(100vh-100px)] flex flex-col">
      <Helmet><title>Ticket #{ticket.id.slice(0,8)} - Admin</title></Helmet>

      <div className="flex items-center justify-between shrink-0">
        <Link to="/admin-portal-secure-access/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Select value={ticket.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        
        {/* Ticket Header */}
        <div className="p-6 border-b border-border bg-muted/10 shrink-0 flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-serif font-bold text-[#1A1A1A]">{ticket.subject}</h1>
              {getStatusBadge(ticket.status)}
              <Badge variant="outline" className="bg-white">{ticket.priority} Priority</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">#{ticket.id}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.createdAt||ticket.created ? format(new Date(ticket.createdAt||ticket.created), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
              <span className="bg-white border border-border px-2 py-0.5 rounded-md">{ticket.category}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-border shrink-0">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary">{customerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">{customer?.name || 'Unknown Customer'}</p>
              <p className="text-xs text-muted-foreground">{customer?.email || customer?.phone}</p>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          
          {/* Original Message */}
          <div className="flex gap-4 max-w-[85%]">
            <Avatar className="w-10 h-10 border border-border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">{customerInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{customer?.name || 'Customer'}</span>
                <span className="text-xs text-muted-foreground">{ticket.createdAt||ticket.created ? format(new Date(ticket.createdAt||ticket.created), 'h:mm a') : ''}</span>
              </div>
              <div className="bg-white border border-border rounded-2xl rounded-tl-none p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.message}
              </div>
              {ticket.attachment && (
                <a 
                  href={ticket.attachment} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors border border-primary/10"
                >
                  <Paperclip className="w-3.5 h-3.5" /> View Attachment
                </a>
              )}
            </div>
          </div>

          {/* Replies */}
          {replies.map((reply) => {
            const isAdmin = reply.is_admin;
            
            return (
              <div key={reply.id} className={`flex gap-4 max-w-[85%] ${isAdmin ? 'ml-auto flex-row-reverse' : ''}`}>
                <Avatar className={`w-10 h-10 border border-border shrink-0 ${isAdmin ? 'bg-yellow-500/10' : ''}`}>
                  <AvatarFallback className={isAdmin ? 'text-yellow-700' : 'bg-primary/10 text-primary'}>
                    {isAdmin ? <ShieldAlert className="w-5 h-5" /> : customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className={`space-y-2 flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{isAdmin ? 'Support Team (You)' : (customer?.name || 'Customer')}</span>
                    <span className="text-xs text-muted-foreground">{reply.createdAt||reply.created ? format(new Date(reply.createdAt||reply.created), 'MMM d, h:mm a') : ''}</span>
                  </div>
                  <div className={`border rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    isAdmin 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] rounded-tr-none' 
                      : 'bg-white border-border rounded-tl-none'
                  }`}>
                    {reply.message}
                  </div>
                  {reply.attachment && (
                    <a 
                      href={reply.attachment} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors border ${
                        isAdmin 
                          ? 'text-white bg-white/10 border-white/20 hover:bg-white/20' 
                          : 'text-primary bg-primary/5 border-primary/10 hover:bg-primary/10'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" /> View Attachment
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Form */}
        <div className="p-4 border-t border-border bg-white shrink-0">
          <form onSubmit={handleReplySubmit} className="flex flex-col gap-3">
            <Textarea 
              placeholder="Type your reply to the customer..." 
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="min-h-[100px] resize-y bg-gray-50 focus:bg-white transition-colors"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  id="admin-reply-file" 
                  className="hidden" 
                  onChange={(e) => setReplyFile(e.target.files[0])}
                  disabled={isSubmitting}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-muted-foreground bg-white"
                  onClick={() => document.getElementById('admin-reply-file').click()}
                  disabled={isSubmitting}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  {replyFile ? replyFile.name : 'Attach File'}
                </Button>
                {replyFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReplyFile(null)} className="text-destructive h-8 px-2">
                    Remove
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleStatusChange('Resolved')}
                    disabled={isSubmitting}
                    className="bg-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Resolved
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting || (!replyMessage.trim() && !replyFile)} className="bg-[#1A1A1A] hover:bg-[#333333] text-white">
                  <Send className="w-4 h-4 mr-2" /> Send Reply
                </Button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminSupportTicketDetailPage;
