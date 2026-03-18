import { useState, useEffect } from 'react';
import api from '@/lib/api.js';

const COLLECTION_MAP = {
  products:          '/products',
  categories:        '/categories',
  banners:           '/banners',
  homepage_sections: '/homepage',
  orders:            '/orders',
  coupons:           '/coupons',
};

export const useFetch = (collection, _options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const path = COLLECTION_MAP[collection] || null;

  useEffect(() => {
    if (!path) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.get(`${path}?limit=500`);
        if (!cancelled) {
          setData(Array.isArray(result) ? result : result.orders || result.items || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [path]);

  return { data, loading, error };
};
