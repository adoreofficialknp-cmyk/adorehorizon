import React, { createContext, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

/**
 * AdminAuthContext now delegates entirely to AuthContext.
 * Kept for backwards compatibility with components importing it.
 */
export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  const adminLogin = async (email, password) => {
    return auth.adminLogin(email, password);
  };

  const adminLogout = () => {
    auth.logout();
  };

  return (
    <AdminAuthContext.Provider value={{
      currentAdmin: auth.isAdmin ? auth.currentUser : null,
      loading: auth.initialLoading,
      adminLogin,
      adminLogout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
