
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Star, Search, Filter, CheckCircle, XCircle, Trash2, Eye, RefreshCw } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReviewDetailsModal from '@/components/admin/ReviewDetailsModal';

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await api.get('/reviews?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.items || [], totalPages: d.totalPages || 1 }));
      setReviews(result.items);
      setSelectedReviews([]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateAnalytics = async (productId) => {
    try {
      const allApproved = await api.get('/reviews?limit=500').then(d => Array.isArray(d) ? d : d.items || []);
      
      const total = allApproved.length;
      const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
      const avg = total > 0 ? sum / total : 0;
      
      const dist = { 1:0, 2:0, 3:0, 4:0, 5:0 };
      allApproved.forEach(r => dist[r.rating]++);

      // Update product rating/reviewCount from the backend (reviews route handles this automatically)
      // The POST /reviews and DELETE /reviews/:id endpoints already recalculate rating + reviewCount
    } catch (err) {
      console.error('Failed to update analytics:', err);
    }
  };

  const handleStatusChange = async (id, newStatus, productId, userId) => {
    try {
      await api.put('/reviews/' + id, { status: newStatus });
      
      if (newStatus === 'approved') {
        await updateAnalytics(productId);
        // Notify user
        try {
          // notifications not available in this backend version
        } catch (e) { console.error('Notification failed', e); }
      } else if (newStatus === 'rejected') {
        // If it was previously approved, we need to recalculate analytics
        const oldReview = reviews.find(r => r.id === id);
        if (oldReview && oldReview.status === 'approved') {
          await updateAnalytics(productId);
        }
      }
      
      toast.success(`Review ${newStatus}`);
      fetchReviews();
      if (isModalOpen) setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${newStatus} review`);
    }
  };

  const handleDelete = async (id, productId, currentStatus) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete('/reviews/' + id);
      if (currentStatus === 'approved') {
        await updateAnalytics(productId);
      }
      toast.success('Review deleted');
      fetchReviews();
      if (isModalOpen) setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedReviews.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} ${selectedReviews.length} reviews?`)) return;
    
    setLoading(true);
    try {
      for (const id of selectedReviews) {
        const review = reviews.find(r => r.id === id);
        if (!review) continue;
        
        if (action === 'delete') {
          await api.delete('/reviews/' + id);
          if (review.status === 'approved') await updateAnalytics(review.product_id);
        } else {
          await api.put('/reviews/' + id, { status: action });
          if (action === 'approved' || review.status === 'approved') {
            await updateAnalytics(review.product_id);
          }
        }
      }
      toast.success(`Bulk action completed`);
      fetchReviews();
    } catch (error) {
      toast.error('Bulk action failed partially or completely');
      fetchReviews();
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedReviews.includes(id)) {
      setSelectedReviews(selectedReviews.filter(rId => rId !== id));
    } else {
      setSelectedReviews([...selectedReviews, id]);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.expand?.product_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.expand?.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Rejected</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet><title>Manage Reviews - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Product Reviews</h1>
          <p className="text-muted-foreground mt-1">Moderate and manage customer feedback</p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading} className="bg-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedReviews.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto bg-muted/50 p-1.5 rounded-lg">
            <span className="text-sm font-medium px-2">{selectedReviews.length} selected</span>
            <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => handleBulkAction('approved')}>Approve</Button>
            <Button size="sm" variant="outline" className="h-8 bg-white" onClick={() => handleBulkAction('rejected')}>Reject</Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleBulkAction('delete')}>Delete</Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No reviews found matching criteria</TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/20">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={() => toggleSelect(review.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-[200px]">
                      {review.expand?.product_id?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{review.expand?.user_id?.name || 'Anonymous'}</span>
                        {review.verified_purchase && <span className="text-[10px] text-green-600 font-medium">Verified</span>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedReviewForModal(review); setIsModalOpen(true); }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {review.status !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange(review.id, 'approved', review.product_id, review.user_id)}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleStatusChange(review.id, 'rejected', review.product_id, review.user_id)}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(review.id, review.product_id, review.status)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReviewDetailsModal 
        review={selectedReviewForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={(id) => handleStatusChange(id, 'approved', selectedReviewForModal.product_id, selectedReviewForModal.user_id)}
        onReject={(id) => handleStatusChange(id, 'rejected', selectedReviewForModal.product_id, selectedReviewForModal.user_id)}
        onDelete={(id) => handleDelete(id, selectedReviewForModal.product_id, selectedReviewForModal.status)}
      />
    </div>
  );
};

export default ReviewListPage;
