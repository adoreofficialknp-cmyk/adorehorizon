
import React from 'react';
import { Search, TrendingUp, Tag } from 'lucide-react';
import api from '@/lib/api.js';
import OptimizedImage from '@/components/OptimizedImage.jsx';

const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() ? 
      <strong key={i} className="text-primary font-semibold">{part}</strong> : 
      part
  );
};

const SearchSuggestionsDropdown = ({ query, suggestions, popularSearches, onSelect }) => {
  const hasProducts = suggestions?.products?.length > 0;
  const hasCategories = suggestions?.categories?.length > 0;
  const showPopular = !query || (!hasProducts && !hasCategories);

  return (
    <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
      
      {/* Categories */}
      {hasCategories && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">Categories</h4>
          <ul className="space-y-1">
            {suggestions.categories.map(cat => (
              <li 
                key={cat.id} 
                className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors" 
                onClick={() => onSelect(cat.name)}
              >
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{highlightMatch(cat.name, query)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Products */}
      {hasProducts && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">Products</h4>
          <ul className="space-y-1">
            {suggestions.products.map(prod => {
              const imgUrl = prod.images?.[0] ? prod.images[0] : null;
              return (
                <li 
                  key={prod.id} 
                  className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors" 
                  onClick={() => onSelect(prod.name)}
                >
                  <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0 border border-border/50">
                    {imgUrl ? (
                      <OptimizedImage src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-muted-foreground opacity-50"/>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate text-foreground">{highlightMatch(prod.name, query)}</span>
                    <span className="text-xs text-muted-foreground">₹{prod.price?.toLocaleString()}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Popular Searches */}
      {showPopular && popularSearches?.length > 0 && (
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">Popular Searches</h4>
          <div className="flex flex-wrap gap-2 px-4">
            {popularSearches.map((term, idx) => (
              <button 
                key={idx} 
                onClick={() => onSelect(term)} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium text-foreground transition-colors"
              >
                <TrendingUp className="w-3 h-3 text-primary" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && !hasProducts && !hasCategories && (
        <div className="px-4 py-6 text-center text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No suggestions found for "{query}"</p>
          <p className="text-xs mt-1">Press enter to search all products</p>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestionsDropdown;
