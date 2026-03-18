import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'sonner';

export const WishlistContext = createContext();

const LOCAL_KEY = 'adore_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, isAuthenticated } = useContext(AuthContext);

  // Load wishlist from localStorage (works for guests + logged-in users)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      setWishlistItems(saved ? JSON.parse(saved) : []);
    } catch { setWishlistItems([]); }
  }, [currentUser?.id]);

  const save = (items) => {
    setWishlistItems(items);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  };

  const addToWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev;
      const next = [...prev, { id: product.id, productId: product.id, ...product }];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      toast.success('Added to wishlist');
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => {
      const next = prev.filter(i => i.id !== productId && i.productId !== productId);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      toast.success('Removed from wishlist');
      return next;
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(i => i.id === productId || i.productId === productId);
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    localStorage.removeItem(LOCAL_KEY);
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount: wishlistItems.length,
      loading,
      getWishlistCount: () => wishlistItems.length,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      shareWishlist: async () => ({ success: false, message: 'Share via URL coming soon' }),
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
