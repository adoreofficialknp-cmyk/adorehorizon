
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Users, Settings, LogOut, 
  Menu, X, Package, Tag, Image as ImageIcon, BarChart3, FileText, Ticket, Star, Activity, Mail, LayoutTemplate, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import NotificationCenter from '@/components/NotificationCenter.jsx';
import SEO from '@/components/SEO.jsx';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-portal-secure-access/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-portal-secure-access' },
        { icon: BarChart3, label: 'Sales Analytics', path: '/admin-portal-secure-access/analytics' },
        { icon: Activity, label: 'Web Analytics', path: '/admin-portal-secure-access/web-analytics' },
      ]
    },
    {
      title: 'Store Management',
      items: [
        { icon: ShoppingBag, label: 'Orders', path: '/admin-portal-secure-access/orders' },
        { icon: Package, label: 'Products', path: '/admin-portal-secure-access/products' },
        { icon: Tag, label: 'Categories', path: '/admin-portal-secure-access/categories' },
        { icon: Users, label: 'Customers', path: '/admin-portal-secure-access/users' },
        { icon: Star, label: 'Reviews', path: '/admin-portal-secure-access/reviews' },
      ]
    },
    {
      title: 'Customer Support',
      items: [
        { icon: MessageSquare, label: 'Support Tickets', path: '/admin-portal-secure-access/support' },
      ]
    },
    {
      title: 'Marketing & Content',
      items: [
        { icon: LayoutTemplate, label: 'Homepage Builder', path: '/admin-portal-secure-access/homepage-builder' },
        { icon: Ticket, label: 'Coupons', path: '/admin-portal-secure-access/coupons' },
        { icon: FileText, label: 'Media Library', path: '/admin-portal-secure-access/media' },
      ]
    },
    {
      title: 'Communications',
      items: [
        { icon: Mail, label: 'Email Logs', path: '/admin-portal-secure-access/email-logs' },
        { icon: LayoutTemplate, label: 'Email Templates', path: '/admin-portal-secure-access/email-templates' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'Settings', path: '/admin-portal-secure-access/settings' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <SEO 
        title="Admin Portal - ADORE Jewellery" 
        robots="noindex, nofollow" 
      />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1A1A1A] text-white transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link to="/admin-portal-secure-access" className="text-xl font-serif font-bold tracking-wider">
            ADORE <span className="text-primary text-sm font-sans tracking-normal ml-1">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-6">
          <div className="px-4 space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx}>
                <h4 className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                                   (item.path !== '/admin-portal-secure-access' && location.pathname.startsWith(item.path));
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 shrink-0">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <span className="text-sm text-muted-foreground">Welcome back, Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
