/**
 * SearchAnalytics stub — search_analytics collection not in new backend.
 * Extend this when you add analytics to the API.
 */
export const trackSearch = (_query, _results) => {
  // no-op — placeholder for future analytics
};

export const getSearchAnalytics = async () => [];
export const getTopSearches    = async () => [];
export const clearAnalytics    = () => {};
