
import React from 'react';
import { Filter, X, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Badge } from '@/components/ui/badge.jsx';

const FilterPanel = ({ filters, onChange, categories = [] }) => {
  
  const materials = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'Diamond', 'Pearl'];
  const styles = ['Classic', 'Modern', 'Vintage', 'Contemporary', 'Minimalist'];
  const colors = ['Gold', 'Silver', 'Rose', 'White', 'Black', 'Blue', 'Green', 'Red'];

  const handleArrayToggle = (key, value, checked) => {
    const current = filters[key] || [];
    const updated = checked 
      ? [...current, value]
      : current.filter(item => item !== value);
    onChange({ ...filters, [key]: updated });
  };

  const handleValueChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      category: [],
      material: [],
      style: [],
      color: [],
      minPrice: 0,
      maxPrice: 100000,
      rating: 0,
      inStock: false
    });
  };

  const activeFilterCount = 
    (filters.category?.length || 0) + 
    (filters.material?.length || 0) + 
    (filters.style?.length || 0) + 
    (filters.color?.length || 0) + 
    (filters.minPrice > 0 ? 1 : 0) + 
    (filters.maxPrice < 100000 ? 1 : 0) + 
    (filters.rating > 0 ? 1 : 0) + 
    (filters.inStock ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="font-serif font-semibold text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {activeFilterCount}
            </Badge>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
            Clear All
          </button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'material']} className="w-full">
        
        {/* Categories */}
        {categories.length > 0 && (
          <AccordionItem value="category" className="border-b-0 mb-2">
            <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-3 px-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`cat-${cat.id}`} 
                      checked={filters.category?.includes(cat.name)}
                      onCheckedChange={(c) => handleArrayToggle('category', cat.name, c)}
                    />
                    <label htmlFor={`cat-${cat.id}`} className="text-sm leading-none cursor-pointer flex-1">
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price Range */}
        <AccordionItem value="price" className="border-b-0 mb-2">
          <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-6 px-3 pb-2">
              <Slider 
                defaultValue={[filters.minPrice || 0, filters.maxPrice || 100000]} 
                max={100000} 
                step={500}
                onValueChange={(vals) => {
                  handleValueChange('minPrice', vals[0]);
                  handleValueChange('maxPrice', vals[1]);
                }}
                className="mb-6"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Min</span>
                  <span className="text-sm font-medium">₹{filters.minPrice || 0}</span>
                </div>
                <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Max</span>
                  <span className="text-sm font-medium">₹{filters.maxPrice || 100000}</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Material */}
        <AccordionItem value="material" className="border-b-0 mb-2">
          <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Material</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-3 px-2">
              {materials.map(mat => (
                <div key={mat} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`mat-${mat}`} 
                    checked={filters.material?.includes(mat)}
                    onCheckedChange={(c) => handleArrayToggle('material', mat, c)}
                  />
                  <label htmlFor={`mat-${mat}`} className="text-sm leading-none cursor-pointer">
                    {mat}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Style */}
        <AccordionItem value="style" className="border-b-0 mb-2">
          <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Style</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-3 px-2">
              {styles.map(style => (
                <div key={style} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`style-${style}`} 
                    checked={filters.style?.includes(style)}
                    onCheckedChange={(c) => handleArrayToggle('style', style, c)}
                  />
                  <label htmlFor={`style-${style}`} className="text-sm leading-none cursor-pointer">
                    {style}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating" className="border-b-0 mb-2">
          <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-3 px-2">
              {[4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`rating-${stars}`} 
                    checked={filters.rating === stars}
                    onCheckedChange={(c) => handleValueChange('rating', c ? stars : 0)}
                  />
                  <label htmlFor={`rating-${stars}`} className="text-sm leading-none cursor-pointer flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    & Up
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="stock" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline font-medium bg-muted/30 px-4 rounded-lg">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between pt-3 px-2">
              <label htmlFor="in-stock" className="text-sm leading-none cursor-pointer">
                In Stock Only
              </label>
              <Switch 
                id="in-stock" 
                checked={filters.inStock || false}
                onCheckedChange={(c) => handleValueChange('inStock', c)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

export default FilterPanel;
