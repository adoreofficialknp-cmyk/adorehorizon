
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Paperclip, Send, Clock, User, ShieldAlert, Download, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import api from '@/lib/api.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const SupportTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { fetchTicketDetails, addReply, updateTicketStatus, loading } = useSupportTickets();
  
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTicketDetails(id);
        // Verify ownership
        if (data.ticket.customer_id !== currentUser?.id && !currentUser?.is_admin) {
          toast.error('Unauthorized access');
          navigate('/support-tickets');
          return;
        }
        setTicket(data.ticket);
        setReplies(data.replies);
        scrollToBottom();
      } catch (error) {
        toast.error('Ticket not found');
        navigate('/support-tickets');
      }
    };
    if (currentUser) loadData();
  }, [id, currentUser, fetchTicketDetails, navigate]);

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
      const newReply = await addReply(id, currentUser.id, replyMessage, replyFile, false);
      // Expand user for immediate display
      newReply.expand = { user_id: currentUser };
      setReplies([...replies, newReply]);
      setReplyMessage('');
      setReplyFile(null);
      scrollToBottom();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    setIsClosing(true);
    try {
      const updated = await updateTicketStatus(id, 'Closed');
      setTicket(updated);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsClosing(false);
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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Ticket #{ticket.id.slice(0,8)} - ADORE Jewellery</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link to="/support-tickets" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
        </Link>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
          
          {/* Ticket Header */}
          <div className="p-6 border-b border-border bg-muted/10 shrink-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground">{ticket.subject}</h1>
                  {getStatusBadge(ticket.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">#{ticket.id}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.createdAt||ticket.created ? format(new Date(ticket.createdAt||ticket.created), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  <span className="bg-muted px-2 py-0.5 rounded-md">{ticket.category}</span>
                </div>
              </div>
              
              {!isClosed && (
                <Button variant="outline" onClick={handleCloseTicket} disabled={isClosing} className="shrink-0">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                </Button>
              )}
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
            
            {/* Original Message */}
            <div className="flex gap-4 max-w-[85%]">
              <Avatar className="w-10 h-10 border border-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">ME</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">You</span>
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
              const isMe = reply.user_id === currentUser.id;
              const isAdmin = reply.is_admin;
              
              return (
                <div key={reply.id} className={`flex gap-4 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  <Avatar className={`w-10 h-10 border border-border shrink-0 ${isAdmin ? 'bg-yellow-500/10' : ''}`}>
                    <AvatarFallback className={isAdmin ? 'text-yellow-700' : 'bg-primary/10 text-primary'}>
                      {isAdmin ? <ShieldAlert className="w-5 h-5" /> : 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`space-y-2 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{isAdmin ? 'Support Team' : 'You'}</span>
                      <span className="text-xs text-muted-foreground">{reply.createdAt||reply.created ? format(new Date(reply.createdAt||reply.created), 'MMM d, h:mm a') : ''}</span>
                    </div>
                    <div className={`border rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                      isMe 
                        ? 'bg-primary text-primary-foreground border-primary rounded-tr-none' 
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
                          isMe 
                            ? 'text-primary-foreground bg-primary/20 border-primary-foreground/20 hover:bg-primary/30' 
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
            {isClosed ? (
              <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-xl border border-border">
                This ticket has been closed. If you need further assistance, please open a new ticket.
              </div>
            ) : (
              <form onSubmit={handleReplySubmit} className="flex flex-col gap-3">
                <Textarea 
                  placeholder="Type your reply here..." 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-[80px] resize-y bg-muted/30 focus:bg-white transition-colors"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      id="reply-file" 
                      className="hidden" 
                      onChange={(e) => setReplyFile(e.target.files[0])}
                      disabled={isSubmitting}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={() => document.getElementById('reply-file').click()}
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
                  <Button type="submit" disabled={isSubmitting || (!replyMessage.trim() && !replyFile)}>
                    <Send className="w-4 h-4 mr-2" /> Send Reply
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SupportTicketDetailPage;
