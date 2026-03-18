
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading, isAdmin, currentUser } = useContext(AuthContext);
  const location = useLocation();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse font-serif text-2xl">Verifying secure access...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin-portal-secure-access/login" state={{ from: location }} replace />;
  }

  // isAdmin is set by AuthContext when role === 'admin'
  if (!isAdmin) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
