
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Heart, User, ShieldAlert } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { AuthContext } from '@/contexts/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { getWishlistCount } = useWishlist();
  const { getCartCount } = useCart();
  const { isAdmin, currentUser } = useContext(AuthContext);

  // Hide on auth and admin routes
  const hideRoutes = ['/login', '/signup'];
  if (hideRoutes.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  const hasAdminAccess = isAdmin || currentUser?.phone === '7897671348' || currentUser?.is_admin;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop', badge: getCartCount() },
    { icon: Search, label: 'Search', path: '/shop?search=' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: getWishlistCount() },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  if (hasAdminAccess) {
    navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin-portal-secure-access', isSpecial: true });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-[70px] bg-background border-t border-border z-[1000] pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-full px-2 py-[8px] max-w-3xl mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path) && item.path !== '/shop?search=');
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors duration-200 ${
                isActive 
                  ? (item.isSpecial ? 'text-yellow-600' : 'text-primary') 
                  : (item.isSpecial ? 'text-yellow-600/70 hover:text-yellow-600' : 'text-foreground opacity-70 hover:opacity-100')
              }`}
            >
              {isActive && !item.isSpecial && (
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
              {isActive && item.isSpecial && (
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-1 bg-yellow-600 rounded-b-full" />
              )}
              <div className="relative mt-1">
                <Icon className="h-[24px] w-[24px]" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-background">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[12px] mt-1 ${isActive ? 'font-semibold underline underline-offset-2' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
