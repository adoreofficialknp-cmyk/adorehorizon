
const cache = new Map();
const stats = { hits: 0, misses: 0 };

/**
 * Set data in cache with a Time-To-Live (TTL)
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlMinutes - Time to live in minutes (default: 5)
 */
export const cacheSet = (key, data, ttlMinutes = 5) => {
  // Prevent memory bloat by limiting cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  cache.set(key, { data, expiresAt });
};

/**
 * Get data from cache if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const cacheGet = (key) => {
  const item = cache.get(key);
  if (!item) {
    stats.misses++;
    return null;
  }
  
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    stats.misses++;
    return null;
  }
  
  stats.hits++;
  return item.data;
};

/**
 * Clear specific cache key
 * @param {string} key - Cache key
 */
export const cacheInvalidate = (key) => {
  cache.delete(key);
};

/**
 * Clear all cached data
 */
export const clearAllCache = () => {
  cache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    ...stats,
    size: cache.size,
    hitRate: stats.hits + stats.misses > 0 
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' 
      : '0%'
  };
};

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map();

/**
 * Fetch with caching, deduplication, and stale-while-revalidate pattern
 */
export const fetchWithCache = async (key, fetcher, ttlMinutes = 5) => {
  // 1. Check cache
  const cached = cacheGet(key);
  if (cached) {
    // Stale-while-revalidate: If cache is older than half its TTL, fetch in background
    const item = cache.get(key);
    const age = Date.now() - (item.expiresAt - ttlMinutes * 60 * 1000);
    if (age > (ttlMinutes * 60 * 1000) / 2 && !inFlightRequests.has(key)) {
      fetcher().then(data => cacheSet(key, data, ttlMinutes)).catch(() => {});
    }
    return cached;
  }

  // 2. Check if request is already in flight
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  // 3. Fetch and cache
  const promise = fetcher().then(data => {
    cacheSet(key, data, ttlMinutes);
    inFlightRequests.delete(key);
    return data;
  }).catch(err => {
    inFlightRequests.delete(key);
    throw err;
  });

  inFlightRequests.set(key, promise);
  return promise;
};
