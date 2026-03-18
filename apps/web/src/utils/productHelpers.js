
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const getProductBadges = (product) => {
  return [];
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price).replace('INR', '₹');
};

export const filterProducts = (products, filters) => {
  if (!products) return [];
  
  let filtered = [...products];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.category) {
    if (Array.isArray(filters.category) && filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category.includes(p.category));
    } else if (typeof filters.category === 'string') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
  }
  
  if (filters.gender && filters.gender.length > 0) {
    filtered = filtered.filter(p => filters.gender.includes(p.gender));
  }
  
  if (filters.color && filters.color.length > 0) {
    filtered = filtered.filter(p => filters.color.includes(p.color));
  }
  
  if (filters.material && filters.material.length > 0) {
    filtered = filtered.filter(p => filters.material.includes(p.material));
  }
  
  if (filters.priceRange) {
    if (filters.priceRange.min !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.priceRange.min);
    }
    if (filters.priceRange.max !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.priceRange.max);
    }
  }
  
  if (filters.rating) {
    filtered = filtered.filter(p => (p.rating || 0) >= filters.rating);
  }
  
  if (filters.availability) {
    if (filters.availability === 'in-stock') {
      filtered = filtered.filter(p => p.stock > 0);
    } else if (filters.availability === 'out-of-stock') {
      filtered = filtered.filter(p => !p.stock || p.stock <= 0);
    }
  }
  
  return filtered;
};

export const sortProducts = (products, sortBy) => {
  if (!products) return [];
  
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
      
    case 'price-high-low':
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
      
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
      
    case 'best-sellers':
      return sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      
    case 'top-rated':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
    case 'discount':
      return sorted.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
      
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
    default:
      return sorted;
  }
};
