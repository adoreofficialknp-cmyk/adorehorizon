
import React from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchHistoryPanel = ({ history, onSelect, onRemove, onClear }) => {
  if (!history || history.length === 0) return null;
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear} 
          className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          Clear All
        </Button>
      </div>
      <ul className="space-y-1">
        {history.map((item, idx) => (
          <li 
            key={idx} 
            className="flex items-center justify-between px-2 py-1.5 mx-2 hover:bg-muted/50 rounded-md group cursor-pointer transition-colors"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground truncate">{item}</span>
            </div>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onRemove(item); 
              }} 
              className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0"
              aria-label="Remove from history"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistoryPanel;
