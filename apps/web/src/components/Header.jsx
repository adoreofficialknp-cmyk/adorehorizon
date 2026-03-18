
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Moon, Sun, User, LogOut, ShieldCheck, Menu, X, HelpCircle } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/hooks/useCart.js';
import { useWishlist } from '@/hooks/useWishlist.js';
import { Button } from '@/components/ui/button.jsx';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import SearchBar from './search/SearchBar.jsx';

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, isAdmin, currentUser, logout } = useContext(AuthContext);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const showAdminPanel = currentUser?.is_admin === true || isAdmin;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/shop?sort=newest' },
    { name: 'Help Center', path: '/help' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[999] smooth-transition ${
      isScrolled ? 'py-3 bg-background/95 backdrop-blur-md shadow-md border-b border-border' : 'py-5 bg-background border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-[#D4AF37] smooth-transition">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <span className="text-2xl luxury-text gold-accent">ADORE</span>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="mb-8">
                  <SearchBar onSearchComplete={() => setIsMobileMenuOpen(false)} />
                </div>
                <nav className="flex flex-col gap-4">
                  {navLinks.map(link => (
                    <Link key={link.name} to={link.path} className="text-lg font-medium text-foreground hover:text-[#D4AF37] smooth-transition py-2 border-b border-border/50">
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-6 border-t border-border bg-muted/30">
                {isAuthenticated() ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{currentUser?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.email || currentUser?.phone}</p>
                      </div>
                    </div>
                    {showAdminPanel && (
                      <Button asChild variant="outline" className="w-full justify-start luxury-button-outline">
                        <Link to="/admin-portal-secure-access"><ShieldCheck className="w-4 h-4 mr-2" /> Admin Panel</Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full justify-start luxury-button-outline">
                      <Link to="/profile"><User className="w-4 h-4 mr-2" /> My Profile</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 smooth-transition" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="luxury-button w-full text-center">
                      Login
                    </Link>
                    <Link to="/signup" className="luxury-button-secondary w-full text-center">
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 hover-lift">
          <span className="text-[28px] md:text-[32px] luxury-text gold-accent leading-none">
            ADORE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 mx-8 shrink-0">
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-medium uppercase tracking-wider smooth-transition relative group ${location.pathname === link.path ? 'gold-accent' : 'text-foreground hover:text-[#D4AF37]'}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#D4AF37] transform origin-left smooth-transition ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </Link>
          ))}
        </nav>

        {/* Desktop Search Bar */}
        <div className="hidden lg:block flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Right: Icons & Auth */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          
          <button onClick={toggleDarkMode} className="text-foreground hover:text-[#D4AF37] smooth-transition p-2 rounded-full hover:bg-muted hover-lift" aria-label="Toggle Dark Mode">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated() && <NotificationCenter />}

          <Link to="/wishlist" className="relative text-foreground hover:text-[#D4AF37] smooth-transition p-2 rounded-full hover:bg-muted hidden sm:flex hover-lift" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {getWishlistCount() > 0 && (
              <span className="absolute top-1 right-1 bg-[#D4AF37] text-[#1a1a1a] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-background">
                {getWishlistCount()}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative text-foreground hover:text-[#D4AF37] smooth-transition p-2 rounded-full hover:bg-muted hover-lift" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {getCartCount() > 0 && (
              <span className="absolute top-1 right-1 bg-[#D4AF37] text-[#1a1a1a] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-background">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center ml-2 pl-4 border-l border-border gap-3">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                {showAdminPanel && (
                  <Link to="/admin-portal-secure-access" className="text-sm font-medium text-[#D4AF37] hover:text-[#D4AF37]/80 smooth-transition flex items-center gap-1 hover-lift">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 text-foreground hover:text-[#D4AF37] smooth-transition group hover-lift">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#D4AF37]/10 smooth-transition">
                    <User className="h-4 w-4" />
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive smooth-transition p-2 rounded-full hover:bg-destructive/10 hover-lift" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-foreground hover:text-[#D4AF37] smooth-transition">
                  Login
                </Link>
                <Link to="/signup" className="luxury-button text-sm py-2 px-5 min-h-0">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
