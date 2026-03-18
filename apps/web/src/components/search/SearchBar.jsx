
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx';
import { useSearch } from '@/hooks/useSearch.js';
import SearchHistoryPanel from './SearchHistoryPanel.jsx';
import SearchSuggestionsDropdown from './SearchSuggestionsDropdown.jsx';

const SearchBar = ({ className, autoFocus = false, onSearchComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    getSearchSuggestions, 
    getSearchHistory, 
    addToSearchHistory, 
    removeSearchHistoryItem, 
    clearSearchHistory,
    getPopularSearches
  } = useSearch();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [history, setHistory] = useState([]);
  const [popular, setPopular] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Initialize from URL if on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) setQuery(q);
    }
  }, [location]);

  // Load history and popular searches on mount
  useEffect(() => {
    setHistory(getSearchHistory());
    getPopularSearches().then(setPopular);
  }, [getSearchHistory, getPopularSearches]);

  // Handle autoFocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        setIsOpen(true);
      }, 100);
    }
  }, [autoFocus]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ products: [], categories: [] });
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const results = await getSearchSuggestions(query);
      setSuggestions(results);
      setIsTyping(false);
    }, 300);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query, getSearchSuggestions]);

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    addToSearchHistory(finalQuery);
    setHistory(getSearchHistory());
    setIsOpen(false);
    
    if (onSearchComplete) onSearchComplete();
    
    navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={`relative w-full group ${className}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search jewelry, collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-10 h-10 bg-muted/50 border-transparent focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary rounded-full text-sm transition-all"
          />
          {query && (
            <button 
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border overflow-hidden" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent stealing focus from input
      >
        {isTyping ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Searching...</span>
          </div>
        ) : (
          <>
            {!query && history.length > 0 && (
              <SearchHistoryPanel 
                history={history} 
                onSelect={handleSearch}
                onRemove={(item) => {
                  removeSearchHistoryItem(item);
                  setHistory(getSearchHistory());
                }}
                onClear={() => {
                  clearSearchHistory();
                  setHistory([]);
                }}
              />
            )}
            
            <SearchSuggestionsDropdown 
              query={query}
              suggestions={suggestions}
              popularSearches={popular}
              onSelect={handleSearch}
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
