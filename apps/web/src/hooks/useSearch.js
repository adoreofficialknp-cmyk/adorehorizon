import { useState, useCallback } from 'react';
import api from '@/lib/api.js';

const HISTORY_KEY = 'adore_search_history';
const MAX_HISTORY = 10;

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSearchHistory = useCallback(() => {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch { return []; }
  }, []);

  const addToSearchHistory = useCallback((query) => {
    if (!query?.trim()) return;
    const term = query.trim();
    const history = getSearchHistory();
    const newHistory = [term, ...history.filter(q => q.toLowerCase() !== term.toLowerCase())].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  }, [getSearchHistory]);

  const clearSearchHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const removeSearchHistoryItem = useCallback((query) => {
    const history = getSearchHistory();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter(q => q !== query)));
  }, [getSearchHistory]);

  const getPopularSearches = useCallback(async () => {
    return ['Gold Ring', 'Diamond Necklace', 'Silver Bracelet', 'Engagement Rings', 'Pearl Earrings'];
  }, []);

  const getSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return { products: [], categories: [] };
    try {
      const [prodData, catData] = await Promise.all([
        api.get(`/products?search=${encodeURIComponent(query)}&limit=5`),
        api.get(`/categories?limit=10`),
      ]);
      const products = Array.isArray(prodData) ? prodData : prodData.items || [];
      const allCats  = Array.isArray(catData)  ? catData  : catData.items  || [];
      const categories = allCats.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
      return { products, categories };
    } catch { return { products: [], categories: [] }; }
  }, []);

  const searchProducts = useCallback(async (query, filters = {}, page = 1, sort = 'createdAt') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20, sort });
      if (query)            params.set('search', query);
      if (filters.category) { if (Array.isArray(filters.category)) { filters.category.forEach(cat => params.append('category', cat)); } else { params.set('category', filters.category); } }
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.color) { if (Array.isArray(filters.color)) { filters.color.forEach(col => params.append('color', col)); } else { params.set('color', filters.color); } }
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.featured) params.set('featured', 'true');

      const result = await api.get(`/products?${params.toString()}`);
      return {
        items: Array.isArray(result) ? result : result.items || [],
        totalItems: result.total ?? result.totalItems ?? 0,
        totalPages: result.totalPages ?? Math.ceil((result.total ?? result.totalItems ?? 0) / 20),
      };
    } catch (err) {
      setError(err.message);
      return { items: [], totalItems: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading, error,
    searchProducts, getSearchSuggestions,
    getSearchHistory, addToSearchHistory,
    clearSearchHistory, removeSearchHistoryItem,
    getPopularSearches,
  };
};
