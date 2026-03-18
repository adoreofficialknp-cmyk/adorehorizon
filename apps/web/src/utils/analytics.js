
import ReactGA from 'react-ga4';
import { isConsentGranted, isDoNotTrackEnabled } from './privacyConsent';

const isEnabled = () => {
  return import.meta.env.VITE_ANALYTICS_ENABLED !== 'false' && 
         isConsentGranted() && 
         !isDoNotTrackEnabled();
};

export const initGA = (measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID) => {
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    console.warn('[Analytics] GA Measurement ID not configured properly.');
    return;
  }

  if (isDoNotTrackEnabled()) {
    console.info('[Analytics] Do Not Track is enabled. Analytics disabled.');
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true,
      }
    });
    
    // Set initial consent state
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        'analytics_storage': isConsentGranted() ? 'granted' : 'denied'
      });
    }
    
    console.info('[Analytics] GA4 Initialized');
  } catch (error) {
    console.error('[Analytics] Failed to initialize GA4:', error);
  }
};

export const trackPageView = (pageName, pageTitle, pageLocation) => {
  if (!isEnabled()) return;
  try {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: pageName, 
      title: pageTitle || document.title,
      location: pageLocation || window.location.href
    });
  } catch (error) {
    console.error('[Analytics] PageView tracking failed:', error);
  }
};

export const trackEvent = (eventName, eventParams = {}) => {
  if (!isEnabled()) return;
  try {
    ReactGA.event(eventName, eventParams);
    if (import.meta.env.MODE === 'development') {
      console.log(`[Analytics Event] ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error('[Analytics] Event tracking failed:', error);
  }
};

// --- E-commerce Events ---

export const trackProductView = (product) => {
  if (!product) return;
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: 1
    }]
  });
};

export const trackProductList = (products, listName = 'Category List') => {
  if (!products || !products.length) return;
  trackEvent('view_item_list', {
    item_list_name: listName,
    items: products.slice(0, 10).map((p, i) => ({
      item_id: p.id,
      item_name: p.name,
      item_category: p.category,
      price: p.price,
      index: i + 1
    }))
  });
};

export const trackSelectItem = (product, listName = 'Category List') => {
  if (!product) return;
  trackEvent('select_item', {
    item_list_name: listName,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price
    }]
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: quantity
    }]
  });
};

export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!product) return;
  trackEvent('remove_from_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: quantity
    }]
  });
};

export const trackViewCart = (cartItems, totalValue) => {
  if (!cartItems || !cartItems.length) return;
  trackEvent('view_cart', {
    currency: 'INR',
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackCheckoutStart = (cartItems, totalValue) => {
  if (!cartItems || !cartItems.length) return;
  trackEvent('begin_checkout', {
    currency: 'INR',
    value: totalValue,
    items: cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

export const trackAddShippingInfo = (shippingTier = 'Standard') => {
  trackEvent('add_shipping_info', {
    shipping_tier: shippingTier
  });
};

export const trackAddPaymentInfo = (paymentType) => {
  trackEvent('add_payment_info', {
    payment_type: paymentType
  });
};

export const trackPurchase = (orderId, totalValue, items, shipping = 0, tax = 0) => {
  if (!items || !items.length) return;
  trackEvent('purchase', {
    transaction_id: orderId,
    value: totalValue,
    currency: 'INR',
    shipping: shipping,
    tax: tax,
    items: items.map(item => ({
      item_id: item.product_id || item.id,
      item_name: item.product_name || item.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

// --- User & Conversion Events ---

export const trackSignup = (method = 'phone') => {
  trackEvent('sign_up', { method });
};

export const trackLogin = (method = 'phone') => {
  trackEvent('login', { method });
};

export const trackSearch = (searchQuery, resultCount = 0) => {
  trackEvent('search', { 
    search_term: searchQuery,
    result_count: resultCount
  });
};

export const trackWishlistAdd = (product) => {
  if (!product) return;
  trackEvent('add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price
    }]
  });
};

export const trackShare = (method, contentType, itemId) => {
  trackEvent('share', {
    method: method,
    content_type: contentType,
    item_id: itemId
  });
};

export const setUserProperties = (userId, customProperties = {}) => {
  if (!isEnabled()) return;
  try {
    ReactGA.set({ 
      user_id: userId,
      ...customProperties
    });
  } catch (error) {
    console.error('[Analytics] Set User Properties failed:', error);
  }
};
