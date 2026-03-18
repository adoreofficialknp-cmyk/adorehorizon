
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Package, Heart, MapPin, Settings, LogOut, ShieldAlert, Edit3, Ruler, MessageSquare } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MyOrdersSection from '@/components/profile/MyOrdersSection.jsx';
import WishlistSection from '@/components/profile/WishlistSection.jsx';
import SavedAddressesSection from '@/components/profile/SavedAddressesSection.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import api from '@/lib/api.js';
import { toast } from 'sonner';

class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card rounded-xl border border-border">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">We couldn't load your profile information.</p>
          <Button onClick={() => window.location.reload()} variant="outline">Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProfilePage = () => {
  const { currentUser, setCurrentUser, logout, initialLoading, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  });
  const [saving, setSaving] = useState(false);
  
  const [ringSize, setRingSize] = useState('');
  const [savingRingSize, setSavingRingSize] = useState(false);

  useEffect(() => {
    if (queryParams.get('tab')) {
      setActiveTab(queryParams.get('tab'));
    }
  }, [location.search]);

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        country: currentUser.country || ''
      });
      setRingSize(currentUser.ring_size || '');
    }
  }, [currentUser, isEditOpen]);

  const handleTabChange = (value) => {
    if (value === 'support') {
      navigate('/support-tickets');
      return;
    }
    setActiveTab(value);
    navigate(`/profile?tab=${value}`, { replace: true });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    try {
      const updated = await api.put('/auth/me', editForm);
      setCurrentUser(updated);
      setIsEditOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRingSize = async () => {
    if (!ringSize) return;
    setSavingRingSize(true);
    try {
      const updated = await api.put('/auth/me', { ring_size: ringSize });
      setCurrentUser(updated);
      toast.success('Ring size saved successfully');
    } catch (error) {
      toast.error('Failed to save ring size');
    } finally {
      setSavingRingSize(false);
    }
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: Package, component: <MyOrdersSection /> },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, component: <WishlistSection /> },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, component: <SavedAddressesSection /> },
    { id: 'support', label: 'Support Tickets', icon: MessageSquare, component: null }, // Redirects to /support-tickets
    { id: 'settings', label: 'Settings', icon: Settings, component: (
      <div className="space-y-6 md:space-y-8 w-full">
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 w-full">
          <h3 className="text-lg font-serif font-semibold mb-4">Account Settings</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">Manage your account preferences and details.</p>
          <Button variant="outline" onClick={() => setIsEditOpen(true)} className="w-full sm:w-auto touch-target h-12">
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile Details
          </Button>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 w-full">
          <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" /> Your Ring Size
          </h3>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">Save your ring size for faster checkout.</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="w-full sm:w-48">
              <Select value={ringSize} onValueChange={setRingSize}>
                <SelectTrigger className="touch-target w-full h-12">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 17 }, (_, i) => i + 4).map(size => (
                    <SelectItem key={size} value={size.toString()}>Size {size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSaveRingSize} 
              disabled={savingRingSize || ringSize === currentUser?.ring_size}
              className="w-full sm:w-auto touch-target h-12"
            >
              {savingRingSize ? 'Saving...' : 'Save Size'}
            </Button>
          </div>
        </div>
        
        <div className="bg-muted/30 border border-border rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="w-full">
            <h3 className="text-lg font-serif font-semibold">Not sure about your size?</h3>
            <p className="text-sm text-muted-foreground mt-1">Find your perfect fit from home with our interactive guide.</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 shrink-0 w-full sm:w-auto touch-target h-12">
            <Link to="/ring-sizer">Open Tool</Link>
          </Button>
        </div>
      </div>
    )},
  ];

  if (initialLoading) {
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

  if (!currentUser) return null;

  const initials = currentUser.name && currentUser.name !== 'User' 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'U';
  const avatarUrl = currentUser.avatar || currentUser.picture || null;
  const hasAdminAccess = currentUser.is_admin === true || currentUser.phone === '7897671348';

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Helmet>
        <title>My Profile - ADORE Jewellery</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 pb-[90px]">
        <ProfileErrorBoundary>
          
          {hasAdminAccess && (
            <div className="mb-6 flex justify-end w-full">
              <Link to="/admin-portal-secure-access" className="w-full sm:w-auto">
                <Button className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-lg transition-all hover:-translate-y-1 touch-target">
                  <ShieldAlert className="w-5 h-5 mr-2" /> Access Admin Panel
                </Button>
              </Link>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-6 luxury-shadow relative w-full">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-md shrink-0">
              <AvatarImage src={avatarUrl} alt={currentUser.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-serif">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1 w-full">
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3">
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
                  {currentUser.name && currentUser.name !== 'User' ? currentUser.name : 'Valued Customer'}
                </h1>
                {hasAdminAccess && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 font-bold">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                  </Badge>
                )}
              </div>
              <div className="mt-3 space-y-1.5 text-sm md:text-base">
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                  <span className="font-medium text-foreground">Phone:</span> {currentUser.phone}
                </p>
                {currentUser.email && (
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <span className="font-medium text-foreground">Email:</span> {currentUser.email}
                  </p>
                )}
                {currentUser.ring_size && (
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <span className="font-medium text-foreground">Ring Size:</span> {currentUser.ring_size}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 mt-5 w-full">
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-border touch-target w-full sm:w-auto h-12">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl sm:text-2xl">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveProfile} className="space-y-4 mt-4 w-full">
                      <div className="space-y-2 w-full">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required className="touch-target w-full h-12" />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" value={currentUser.phone} disabled className="bg-muted text-muted-foreground touch-target w-full h-12" />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="touch-target w-full h-12" />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="touch-target w-full h-12" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="space-y-2 w-full">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="touch-target w-full h-12" />
                        </div>
                        <div className="space-y-2 w-full">
                          <Label htmlFor="state">State</Label>
                          <Input id="state" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} className="touch-target w-full h-12" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 w-full">
                        <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="touch-target w-full sm:w-auto h-12">Cancel</Button>
                        <Button type="submit" disabled={saving} className="touch-target w-full sm:w-auto h-12">{saving ? 'Saving...' : 'Save Changes'}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-destructive hover:bg-destructive/10 touch-target w-full sm:w-auto md:hidden h-12 border border-destructive/20"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
            <div className="hidden md:block absolute top-6 right-6">
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors font-medium touch-target h-12"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>

          {/* Desktop Sidebar Layout / Mobile Tabs */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-28">
                <nav className="flex flex-col">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 touch-target h-14 ${
                          isActive 
                            ? 'border-primary bg-primary/5 text-primary font-medium' 
                            : 'border-transparent text-foreground hover:bg-muted/20'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-max">
                <TabsList className="h-auto bg-card border border-border p-1 inline-flex w-full">
                  {menuItems.map((item) => (
                    <TabsTrigger 
                      key={item.id} 
                      value={item.id}
                      className="px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap touch-target h-12 flex-1"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 w-full">
              {menuItems.find(item => item.id === activeTab)?.component}
            </div>

          </div>
        </ProfileErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
