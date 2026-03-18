
import React, { Suspense, useEffect, useState, useContext } from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider, AuthContext } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AdminProtectedRoute from '@/components/AdminProtectedRoute.jsx';
import AdminLayout from '@/components/AdminLayout.jsx';
import BottomNavigation from '@/components/BottomNavigation.jsx';
import LoadingOverlay from '@/components/LoadingOverlay.jsx';
import CookieConsent from '@/components/CookieConsent.jsx';
import { initGA, trackPageView } from '@/utils/analytics.js';
import { initPerformanceMonitoring } from '@/utils/performanceMonitor.js';

// Lazy loaded pages for performance (Code Splitting)
const HomePage = React.lazy(() => import('./pages/HomePage.jsx'));
const ShopPage = React.lazy(() => import('./pages/ShopPage.jsx'));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage.jsx'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage.jsx'));
const CartPage = React.lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage.jsx'));
const OrderSuccessPage = React.lazy(() => import('./pages/OrderSuccessPage.jsx'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage.jsx'));
const SharedWishlistPage = React.lazy(() => import('./pages/SharedWishlistPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));
const OrderTrackingPage = React.lazy(() => import('./pages/OrderTrackingPage.jsx'));
const TrackOrderPage = React.lazy(() => import('./pages/TrackOrderPage.jsx'));
const RingSizerPage = React.lazy(() => import('./pages/RingSizerPage.jsx'));
const HelpPage = React.lazy(() => import('./pages/HelpPage.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('./pages/SignupPage.jsx'));
const SupportTicketsPage = React.lazy(() => import('./pages/SupportTicketsPage.jsx'));
const SupportTicketDetailPage = React.lazy(() => import('./pages/SupportTicketDetailPage.jsx'));

// Admin Pages (Lazy)
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUserListPage = React.lazy(() => import('./pages/admin/AdminUserListPage.jsx'));
const ProductListPage = React.lazy(() => import('./pages/admin/ProductListPage.jsx'));
const ProductFormPage = React.lazy(() => import('./pages/admin/ProductFormPage.jsx'));
const CategoryListPage = React.lazy(() => import('./pages/admin/CategoryListPage.jsx'));
const CategoryFormPage = React.lazy(() => import('./pages/admin/CategoryFormPage.jsx'));
const SubcategoryListPage = React.lazy(() => import('./pages/admin/SubcategoryListPage.jsx'));
const SubcategoryFormPage = React.lazy(() => import('./pages/admin/SubcategoryFormPage.jsx'));
const BannerListPage = React.lazy(() => import('./pages/admin/BannerListPage.jsx'));
const BannerFormPage = React.lazy(() => import('./pages/admin/BannerFormPage.jsx'));
const HomepageSectionListPage = React.lazy(() => import('./pages/admin/HomepageSectionListPage.jsx'));
const HomepageSectionFormPage = React.lazy(() => import('./pages/admin/HomepageSectionFormPage.jsx'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage.jsx'));
const CouponListPage = React.lazy(() => import('./pages/admin/CouponListPage.jsx'));
const CouponFormPage = React.lazy(() => import('./pages/admin/CouponFormPage.jsx'));
const ReviewListPage = React.lazy(() => import('./pages/admin/ReviewListPage.jsx'));
const AdminOrderDashboard = React.lazy(() => import('./pages/admin/AdminOrderDashboard.jsx'));
const AdminOrderStatusPage = React.lazy(() => import('./pages/admin/AdminOrderStatusPage.jsx'));
const MediaLibrary = React.lazy(() => import('./pages/admin/MediaLibrary.jsx'));
const UserDataExportPage = React.lazy(() => import('./pages/admin/UserDataExportPage.jsx'));
const AdminHomepageBuilder = React.lazy(() => import('./pages/admin/AdminHomepageBuilder.jsx'));
const SalesAnalyticsPage = React.lazy(() => import('./pages/admin/SalesAnalyticsPage.jsx'));
const AdminAnalyticsDashboard = React.lazy(() => import('./pages/admin/AdminAnalyticsDashboard.jsx'));
const AdminEmailLogsPage = React.lazy(() => import('./pages/admin/AdminEmailLogsPage.jsx'));
const AdminEmailTemplatePreviewPage = React.lazy(() => import('./pages/admin/AdminEmailTemplatePreviewPage.jsx'));
const AdminSupportDashboard = React.lazy(() => import('./pages/admin/AdminSupportDashboard.jsx'));
const AdminSupportTicketDetailPage = React.lazy(() => import('./pages/admin/AdminSupportTicketDetailPage.jsx'));

// Reports
const SalesReportPage = React.lazy(() => import('./pages/admin/reports/SalesReportPage.jsx'));
const ProductReportPage = React.lazy(() => import('./pages/admin/reports/ProductReportPage.jsx'));
const CustomerReportPage = React.lazy(() => import('./pages/admin/reports/CustomerReportPage.jsx'));
const UserExportPage = React.lazy(() => import('./pages/admin/reports/UserExportPage.jsx'));

// Analytics Tracker Component
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname, document.title, window.location.href);
  }, [location]);
  return null;
};

// Auth State Logger Component
const AuthStateLogger = () => {
  const { isAuthenticated, isAdmin, currentUser, initialLoading } = useContext(AuthContext);
  
  useEffect(() => {
    if (!initialLoading) {
      console.log('[App] Global Auth State Updated:', {
        isAuthenticated: isAuthenticated(),
        isAdmin,
        userId: currentUser?.id,
        phone: currentUser?.phone,
        is_admin: currentUser?.is_admin
      });
    }
  }, [isAuthenticated, isAdmin, currentUser, initialLoading]);
  
  return null;
};

// Page Transition Wrapper with Framer Motion
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Inner App Content to use hooks
const AppContent = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Handle route transition loading animation
  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // Short delay to allow smooth transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <AnalyticsTracker />
      <ScrollToTop />
      <LoadingOverlay isLoading={isLoading} />
      <CookieConsent />
      
      <Suspense fallback={<LoadingOverlay isLoading={true} />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Storefront Routes */}
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
            <Route path="/search" element={<PageTransition><SearchResultsPage /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
            <Route path="/checkout" element={<ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute>} />
            <Route path="/order-success/:orderId" element={<PageTransition><OrderSuccessPage /></PageTransition>} />
            <Route path="/order-confirmation/:orderId" element={<PageTransition><OrderConfirmationPage /></PageTransition>} />
            <Route path="/order/:id" element={<PageTransition><OrderConfirmationPage /></PageTransition>} />
            <Route path="/track" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
            <Route path="/track-order" element={<PageTransition><TrackOrderPage /></PageTransition>} />
            <Route path="/track-order/:orderId" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
            <Route path="/order-tracking/:orderId" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
            <Route path="/wishlist" element={<ProtectedRoute><PageTransition><WishlistPage /></PageTransition></ProtectedRoute>} />
            <Route path="/shared-wishlist/:token" element={<PageTransition><SharedWishlistPage /></PageTransition>} />
            <Route path="/ring-sizer" element={<PageTransition><RingSizerPage /></PageTransition>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
            <Route path="/profile/orders/:id/tracking" element={<ProtectedRoute><PageTransition><OrderTrackingPage /></PageTransition></ProtectedRoute>} />
            <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
            <Route path="/support-tickets" element={<ProtectedRoute><PageTransition><SupportTicketsPage /></PageTransition></ProtectedRoute>} />
            <Route path="/support-tickets/:id" element={<ProtectedRoute><PageTransition><SupportTicketDetailPage /></PageTransition></ProtectedRoute>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            
            {/* Admin Portal Routes */}
            <Route path="/admin-portal-secure-access/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
            
            <Route path="/admin-portal-secure-access" element={
              <AdminProtectedRoute>
                <PageTransition><AdminLayout /></PageTransition>
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<SalesAnalyticsPage />} />
              <Route path="web-analytics" element={<AdminAnalyticsDashboard />} />
              <Route path="users" element={<AdminUserListPage />} />
              <Route path="export-users" element={<UserDataExportPage />} />
              
              {/* Products */}
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              
              {/* Categories */}
              <Route path="categories" element={<CategoryListPage />} />
              <Route path="categories/new" element={<CategoryFormPage />} />
              <Route path="categories/:id/edit" element={<CategoryFormPage />} />
              
              {/* Subcategories */}
              <Route path="subcategories" element={<SubcategoryListPage />} />
              <Route path="subcategories/new" element={<SubcategoryFormPage />} />
              <Route path="subcategories/:id/edit" element={<SubcategoryFormPage />} />
              
              {/* Banners & Homepage */}
              <Route path="banners" element={<BannerListPage />} />
              <Route path="banners/new" element={<BannerFormPage />} />
              <Route path="banners/:id/edit" element={<BannerFormPage />} />
              <Route path="homepage-sections" element={<HomepageSectionListPage />} />
              <Route path="homepage-sections/:id/edit" element={<HomepageSectionFormPage />} />
              <Route path="homepage-builder" element={<AdminHomepageBuilder />} />
              
              <Route path="orders" element={<AdminOrderDashboard />} />
              <Route path="orders/:orderId" element={<AdminOrderStatusPage />} />
              <Route path="homepage" element={<HomepageSectionListPage />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Communications & Support */}
              <Route path="email-logs" element={<AdminEmailLogsPage />} />
              <Route path="email-templates" element={<AdminEmailTemplatePreviewPage />} />
              <Route path="support" element={<AdminSupportDashboard />} />
              <Route path="support/:id" element={<AdminSupportTicketDetailPage />} />
              
              {/* Coupons */}
              <Route path="coupons" element={<CouponListPage />} />
              <Route path="coupons/new" element={<CouponFormPage />} />
              <Route path="coupons/:id/edit" element={<CouponFormPage />} />
              
              <Route path="reviews" element={<ReviewListPage />} />
              
              {/* Reports & Exports */}
              <Route path="reports/sales" element={<SalesReportPage />} />
              <Route path="reports/products" element={<ProductReportPage />} />
              <Route path="reports/customers" element={<CustomerReportPage />} />
              <Route path="export/users" element={<UserExportPage />} />
            </Route>

            {/* Alias for Admin Reviews if accessed directly */}
            <Route path="/admin/reviews" element={
              <AdminProtectedRoute>
                <PageTransition>
                  <AdminLayout>
                    <ReviewListPage />
                  </AdminLayout>
                </PageTransition>
              </AdminProtectedRoute>
            } />

            {/* Alias for Admin Orders if accessed directly */}
            <Route path="/admin/orders" element={
              <AdminProtectedRoute>
                <PageTransition>
                  <AdminLayout>
                    <AdminOrderDashboard />
                  </AdminLayout>
                </PageTransition>
              </AdminProtectedRoute>
            } />

          </Routes>
        </AnimatePresence>
      </Suspense>
      
      {/* Global Bottom Navigation for Mobile (Hidden on Admin/Auth Routes internally) */}
      <BottomNavigation />
      
      <Toaster />
    </>
  );
};

function App() {
  useEffect(() => {
    initGA(); // Initialize GA4 if consent is granted
    initPerformanceMonitoring(); // Initialize Web Vitals tracking
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
