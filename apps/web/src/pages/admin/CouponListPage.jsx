
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Ticket } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CouponListPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      let filter = [];
      if (searchTerm) filter.push(`code ~ "${searchTerm}"`);
      
      const now = new Date().toISOString();
      if (statusFilter === 'active') {
        // client-side
      } else if (statusFilter === 'expired') {
        // client-side
      } else if (statusFilter === 'inactive') {
        // client-side
      }

      let data = await api.get(`/coupons?page=${page}&limit=${perPage}`);
      let items = Array.isArray(data) ? data : data.items || [];
      // Client-side filtering (backend returns all, we filter by active/expired)
      if (searchTerm) items = items.filter(c => (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
      if (statusFilter === 'active') items = items.filter(c => c.active && !isExpired(c.expiresAt));
      if (statusFilter === 'expired') items = items.filter(c => isExpired(c.expiresAt));
      if (statusFilter === 'inactive') items = items.filter(c => !c.active);
      const result = { items, totalPages: Array.isArray(data) ? 1 : data.totalPages || 1 };

      setCoupons(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchCoupons(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, statusFilter, page, perPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete('/coupons/' + id);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put('/coupons/' + id, { active: !currentStatus });
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage discount codes and promotions</p>
        </div>
        <Button asChild className="bg-[#C6A769] hover:bg-[#B59658] text-white">
          <Link to="/admin-portal-secure-access/coupons/new">
            <Plus className="w-4 h-4 mr-2" /> Add Coupon
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search coupon code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white uppercase"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <select 
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[40px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Ticket className="h-8 w-8 mb-2 opacity-20" />
                      <p>No coupons found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-sm bg-muted/50">
                          {coupon.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                        {expired && <span className="ml-2 text-xs text-destructive font-medium">(Expired)</span>}
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={coupon.active && !expired} 
                          disabled={expired}
                          onCheckedChange={() => toggleStatus(coupon.id, coupon.active)} 
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link to={`/admin-portal-secure-access/coupons/${coupon.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-white">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponListPage;
