
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import FilterPanel from '@/components/search/FilterPanel.jsx';
import { useSearch } from '@/hooks/useSearch.js';
import { trackSearch } from '@/utils/SearchAnalytics.js';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchProducts, loading } = useSearch();
  
  const query = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;
  const sortParam = searchParams.get('sort') || 'relevance';
  
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  
  // Parse filters from URL
  const [filters, setFilters] = useState({
    category: searchParams.getAll('category') || [],
    material: searchParams.getAll('material') || [],
    style: searchParams.getAll('style') || [],
    color: searchParams.getAll('color') || [],
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 100000,
    rating: parseInt(searchParams.get('rating')) || 0,
    inStock: searchParams.get('inStock') === 'true'
  });

  // Fetch categories for filter panel
  useEffect(() => {
    api.get('/categories').then(d => Array.isArray(d) ? d : d.items || [])
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Fetch products when URL params change
  useEffect(() => {
    const fetchResults = async () => {
      const result = await searchProducts(query, filters, pageParam, sortParam);
      setProducts(result.items);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      
      // Track search analytics
      if (query) {
        trackSearch(query, result.totalItems, filters, sortParam);
      }
    };
    fetchResults();
  }, [query, pageParam, sortParam, JSON.stringify(filters), searchProducts]);

  // Update URL when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sortParam !== 'relevance') params.set('sort', sortParam);
    
    newFilters.category.forEach(c => params.append('category', c));
    newFilters.material.forEach(m => params.append('material', m));
    newFilters.style.forEach(s => params.append('style', s));
    newFilters.color.forEach(c => params.append('color', c));
    
    if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice < 100000) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.rating > 0) params.set('rating', newFilters.rating);
    if (newFilters.inStock) params.set('inStock', 'true');
    
    setSearchParams(params);
  };

  const handleSortChange = (val) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    params.set('page', '1'); // Reset to page 1 on sort
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeFilter = (key, value = null) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[key])) {
      newFilters[key] = newFilters[key].filter(v => v !== value);
    } else {
      if (key === 'minPrice') newFilters.minPrice = 0;
      else if (key === 'maxPrice') newFilters.maxPrice = 100000;
      else if (key === 'rating') newFilters.rating = 0;
      else if (key === 'inStock') newFilters.inStock = false;
    }
    handleFilterChange(newFilters);
  };

  const hasActiveFilters = 
    filters.category.length > 0 || 
    filters.material.length > 0 || 
    filters.style.length > 0 || 
    filters.color.length > 0 || 
    filters.minPrice > 0 || 
    filters.maxPrice < 100000 || 
    filters.rating > 0 || 
    filters.inStock;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{query ? `Search results for "${query}"` : 'Search Products'} - ADORE Jewellery</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        
        {/* Search Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-2">
            {query ? `Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `Showing ${totalItems} ${totalItems === 1 ? 'result' : 'results'}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onChange={handleFilterChange} categories={categories} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <SlidersHorizontal className="w-4 h-4 mr-2" /> 
                      Filters {hasActiveFilters && <Badge className="ml-2 bg-primary text-primary-foreground">Active</Badge>}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="font-serif text-xl">Filter Products</SheetTitle>
                    </SheetHeader>
                    <FilterPanel filters={filters} onChange={handleFilterChange} categories={categories} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters Badges */}
              <div className="flex-1 flex flex-wrap gap-2">
                {filters.category.map(val => (
                  <Badge key={`cat-${val}`} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {val} <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('category', val)} />
                  </Badge>
                ))}
                {filters.material.map(val => (
                  <Badge key={`mat-${val}`} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {val} <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('material', val)} />
                  </Badge>
                ))}
                {(filters.minPrice > 0 || filters.maxPrice < 100000) && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    ₹{filters.minPrice} - ₹{filters.maxPrice} 
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }} />
                  </Badge>
                )}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {filters.rating}+ Stars <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('rating')} />
                  </Badge>
                )}
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    In Stock <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeFilter('inStock')} />
                  </Badge>
                )}
                {hasActiveFilters && (
                  <button onClick={() => handleFilterChange({category:[], material:[], style:[], color:[], minPrice:0, maxPrice:100000, rating:0, inStock:false})} className="text-xs text-muted-foreground hover:text-destructive underline ml-2">
                    Clear All
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="shrink-0">
                <Select value={sortParam} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-muted/30 rounded-3xl border border-border">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your search criteria. Try adjusting your filters or search term.
                </p>
                <Button onClick={() => navigate('/shop')} variant="outline">View All Products</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} listName="Search Results" />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-border">
                    <Button 
                      variant="outline" 
                      disabled={pageParam === 1}
                      onClick={() => handlePageChange(pageParam - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium text-muted-foreground">
                      Page {pageParam} of {totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={pageParam === totalPages}
                      onClick={() => handlePageChange(pageParam + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResultsPage;
