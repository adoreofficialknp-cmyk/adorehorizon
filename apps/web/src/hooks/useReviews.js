import { useState, useCallback } from 'react';
import api from '@/lib/api.js';

/**
 * useReviews hook
 * Provides all review-related functions for the ProductDetailPage.
 * Reviews are fetched from the product endpoint (GET /products/:id includes reviews)
 * and submitted via POST /reviews.
 */
export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch reviews for a product with pagination and sort */
  const fetchProductReviews = useCallback(async (pid, page = 1, sort = 'newest') => {
    const id = pid || productId;
    if (!id) return { items: [], totalPages: 1 };
    try {
      const data = await api.get(`/products/${id}`);
      let items = data.reviews || [];
      // Client-side sort
      if (sort === 'newest')  items = [...items].sort((a, b) => new Date(b.createdAt || b.created) - new Date(a.createdAt || a.created));
      if (sort === 'oldest')  items = [...items].sort((a, b) => new Date(a.createdAt || a.created) - new Date(b.createdAt || b.created));
      if (sort === 'highest') items = [...items].sort((a, b) => b.rating - a.rating);
      if (sort === 'lowest')  items = [...items].sort((a, b) => a.rating - b.rating);
      // Paginate client-side (20 per page)
      const perPage = 20;
      const totalPages = Math.max(1, Math.ceil(items.length / perPage));
      const paged = items.slice((page - 1) * perPage, page * perPage);
      return { items: paged, totalPages };
    } catch (err) {
      return { items: [], totalPages: 1 };
    }
  }, [productId]);

  /** Compute review stats from a product's reviews array */
  const getReviewStats = useCallback(async (pid) => {
    const id = pid || productId;
    if (!id) return { average_rating: 0, total_reviews: 0, rating_distribution: {1:0,2:0,3:0,4:0,5:0} };
    try {
      const data = await api.get(`/products/${id}`);
      const items = data.reviews || [];
      const total = items.length;
      const avg = total > 0 ? items.reduce((s, r) => s + r.rating, 0) / total : 0;
      const dist = {1:0, 2:0, 3:0, 4:0, 5:0};
      items.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
      return { average_rating: parseFloat(avg.toFixed(1)), total_reviews: total, rating_distribution: dist };
    } catch {
      return { average_rating: 0, total_reviews: 0, rating_distribution: {1:0,2:0,3:0,4:0,5:0} };
    }
  }, [productId]);

  /** Check if user has purchased this product (looks at /orders/my) */
  const checkVerifiedPurchase = useCallback(async (pid, userId) => {
    if (!userId) return false;
    try {
      const orders = await api.get('/orders/my').then(d => Array.isArray(d) ? d : []);
      return orders.some(order =>
        (order.orderItems || order.items || []).some(item =>
          item.productId === pid || item.product_id === pid || item.id === pid
        )
      );
    } catch {
      return false;
    }
  }, []);

  /** Submit a new review */
  const submitReview = useCallback(async (pid, userId, rating, title, comment, verified = false) => {
    const id = pid || productId;
    try {
      await api.post('/reviews', { productId: id, rating, title, body: comment });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [productId]);

  /** Toggle helpful vote — not supported server-side, handle client-side */
  const toggleHelpful = useCallback(async (reviewId) => {
    // Helpful votes are not persisted in the backend yet
    return { success: true };
  }, []);

  /** Simple fetchReviews for components that use the basic form */
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await api.get(`/products/${productId}`);
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    reviews, loading, error,
    fetchReviews,
    fetchProductReviews,
    getReviewStats,
    checkVerifiedPurchase,
    submitReview,
    toggleHelpful,
  };
};
