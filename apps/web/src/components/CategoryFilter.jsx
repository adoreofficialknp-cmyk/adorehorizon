
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const CategoryFilter = ({ categories, selectedCategories, onCategoryChange }) => {
  const handleToggle = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const mainCategories = categories?.filter(cat => cat.type === 'category') || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-4 tracking-wide">Categories</h3>
        <div className="space-y-3">
          {mainCategories.map(category => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleToggle(category.id)}
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
