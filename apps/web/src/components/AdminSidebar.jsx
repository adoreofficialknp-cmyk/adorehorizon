
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, LayoutTemplate, 
  ShoppingCart, Ticket, Star, Settings, BarChart3, X,
  Users, Download, FileText, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const menuGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/admin-portal-secure-access', icon: LayoutDashboard, exact: true },
      { name: 'Orders', path: '/admin-portal-secure-access/orders', icon: ShoppingCart },
      { name: 'Products', path: '/admin-portal-secure-access/products', icon: Package },
      { name: 'Categories', path: '/admin-portal-secure-access/categories', icon: Tags },
      { name: 'Subcategories', path: '/admin-portal-secure-access/subcategories', icon: Layers },
      { name: 'Users', path: '/admin-portal-secure-access/users', icon: Users },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Coupons', path: '/admin-portal-secure-access/coupons', icon: Ticket },
      { name: 'Reviews', path: '/admin-portal-secure-access/reviews', icon: Star },
      { name: 'Homepage Builder', path: '/admin-portal-secure-access/homepage', icon: LayoutTemplate },
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { name: 'Sales Report', path: '/admin-portal-secure-access/reports/sales', icon: BarChart3 },
      { name: 'Product Report', path: '/admin-portal-secure-access/reports/products', icon: FileText },
      { name: 'Customer Report', path: '/admin-portal-secure-access/reports/customers', icon: Users },
      { name: 'Export Data', path: '/admin-portal-secure-access/export/users', icon: Download },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', path: '/admin-portal-secure-access/settings', icon: Settings },
    ]
  }
];

const SidebarContent = ({ setOpen }) => (
  <div className="flex flex-col h-full bg-[#1A1A1A] text-white">
    <div className="h-[70px] flex items-center justify-between px-6 border-b border-white/10 shrink-0">
      <span className="text-xl font-bold tracking-wider text-[#C6A769]" style={{ fontFamily: 'Playfair Display, serif' }}>
        ADORE ADMIN
      </span>
      {setOpen && (
        <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
      {menuGroups.map((group, idx) => (
        <div key={idx}>
          <h4 className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">{group.title}</h4>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setOpen && setOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-[14px]
                    ${isActive 
                      ? 'bg-[#C6A769] text-white font-medium shadow-md' 
                      : 'text-white/70 hover:bg-[#333333] hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminSidebar = ({ open, setOpen }) => {
  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-[280px]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="fixed left-0 top-0 z-50 h-full w-[280px] p-0 border-none bg-[#1A1A1A] !translate-x-0 !translate-y-0 sm:max-w-[280px] rounded-none data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
          hideCloseButton={true}
        >
          <DialogTitle className="sr-only">Admin Navigation Menu</DialogTitle>
          <SidebarContent setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSidebar;
