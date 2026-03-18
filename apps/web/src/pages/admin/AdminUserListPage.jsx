
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Download, Eye, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRecord = await api.get('/auth/users?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.items || [], totalPages: d.totalPages || 1 }));
      
      // Fetch all orders to calculate metrics (in a real app with thousands of orders, this needs a backend endpoint)
      const ordersRecord = await api.get('/orders?limit=500').then(d => Array.isArray(d) ? d : d.orders || d.items || []);

      // Calculate metrics per user
      const enrichedUsers = usersRecord.items.map(user => {
        const userOrders = ordersRecord.filter(o => o.user_id === user.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total_price || 0), 0);
        const lastOrder = userOrders.length > 0 
          ? userOrders.sort((a, b) => new Date(b.createdAt||b.created) - new Date(a.createdAt||a.created))[0].createdAt||[0].created 
          : null;

        return {
          ...user,
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate: lastOrder
        };
      });

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-serif">Customers</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your store customers and view their history</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-center">Total Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading customers...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No customers found</TableCell></TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-[#1A1A1A]">
                    {user.name || 'Unnamed User'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email || 'No email'}</div>
                    <div className="text-xs text-muted-foreground">{user.phone || 'No phone'}</div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {user.totalOrders}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    ₹{user.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)} className="hover:text-primary hover:bg-primary/10">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">{selectedUser.name || 'Unnamed User'}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${selectedUser.email}`}>
                    <Mail className="w-4 h-4 mr-2" /> Contact
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="font-medium">{selectedUser.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Joined Date</p>
                  <p className="font-medium">{(selectedUser.createdAt||selectedUser.created) ? new Date(selectedUser.createdAt||selectedUser.created).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Ring Size</p>
                  <p className="font-medium">{selectedUser.ring_size || 'Not set'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{selectedUser.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedUser.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserListPage;
