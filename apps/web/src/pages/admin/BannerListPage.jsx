
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const BannerListPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      let filter = [];
      if (searchTerm) filter.push(`title ~ "${searchTerm}"`);
      if (positionFilter !== 'all') filter.push(`position = "${positionFilter}"`);

      // Client-side filter since backend doesn't support PocketBase filter syntax
      let data = await api.get(`/banners?page=${page}&limit=${perPage}`);
      let items = Array.isArray(data) ? data : data.items || [];
      // Apply client-side filters
      if (searchTerm) items = items.filter(b => (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
      if (positionFilter !== 'all') items = items.filter(b => b.position === positionFilter);
      const result = { items, totalPages: Array.isArray(data) ? 1 : data.totalPages || 1 };

      setBanners(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchBanners(), 300);
    return () => clearTimeout(delay);
  }, [searchTerm, positionFilter, page, perPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete('/banners/' + id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put('/banners/' + id, { active: !currentStatus });
      toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage promotional and hero banners</p>
        </div>
        <Button asChild className="bg-[#C6A769] hover:bg-[#B59658] text-white">
          <Link to="/admin-portal-secure-access/banners/new">
            <Plus className="w-4 h-4 mr-2" /> Add Banner
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search banners..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filter by Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="hero_banner">Hero Banner</SelectItem>
                <SelectItem value="shop_page_top">Shop Page Top</SelectItem>
                <SelectItem value="search_page_top">Search Page Top</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
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
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-20 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[40px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No banners found
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.imageUrl ? (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="h-12 w-20 rounded-md object-cover border border-border"
                        />
                      ) : (
                        <div className="h-12 w-20 rounded-md bg-muted flex items-center justify-center border border-border">
                          <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{banner.title || 'Untitled Banner'}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {banner.position?.replace(/_/g, ' ') || 'Unassigned'}
                    </TableCell>
                    <TableCell>{banner.orderIndex || 0}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={banner.active} 
                        onCheckedChange={() => toggleStatus(banner.id, banner.active)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link to={`/admin-portal-secure-access/banners/${banner.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="h-8 w-8 text-destructive hover:text-destructive">
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

export default BannerListPage;
