
import React, { createContext, useState, useEffect, useContext } from 'react';

import apiServerClient from '@/lib/apiServerClient.js';
import { AuthContext } from './AuthContext.jsx';
import { trackAddToCart, trackRemoveFromCart } from '@/utils/analytics.js';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const savedCart = localStorage.getItem('adore_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize }];
    });
    
    trackAddToCart(product, quantity);
  };

  const removeFromCart = (productId, selectedSize = null) => {
    const itemToRemove = cartItems.find(item => item.id === productId && item.selectedSize === selectedSize);
    if (itemToRemove) {
      trackRemoveFromCart(itemToRemove, itemToRemove.quantity);
    }
    
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedSize === selectedSize)));
  };

  const updateQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    
    const item = cartItems.find(i => i.id === productId && i.selectedSize === selectedSize);
    if (item) {
      if (quantity > item.quantity) {
        trackAddToCart(item, quantity - item.quantity);
      } else if (quantity < item.quantity) {
        trackRemoveFromCart(item, item.quantity - quantity);
      }
    }

    setCartItems(prev => prev.map(item => 
      (item.id === productId && item.selectedSize === selectedSize)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('adore_cart');
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const getCartTotal = () => {
    return cartTotal;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Trigger email notification asynchronously
  const triggerOrderEmail = async (orderId) => {
    try {
      await apiServerClient.fetch('/email/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    } catch (error) {
      console.error('Failed to trigger order email:', error);
      // We don't throw here to avoid breaking the user flow
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      triggerOrderEmail
    }}>
      {children}
    </CartContext.Provider>
  );
};
