
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, GripVertical, Image as ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGES = 10;

const ProductImageManager = ({ existingImages = [], productRecord, onImagesChange }) => {
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize items from existing images
  useEffect(() => {
    if (existingImages && existingImages.length > 0 && productRecord) {
      const initialItems = existingImages.map((img, index) => ({
        id: `existing-${index}`,
        type: 'existing',
        url: img,
        filename: img,
        isMain: index === 0
      }));
      setItems(initialItems);
    }
  }, [existingImages, productRecord]);

  // Notify parent of changes (only new files are sent up for upload)
  useEffect(() => {
    const newFiles = items.filter(item => item.type === 'new').map(item => item.file);
    // We also need to tell the parent about the order and which existing images to keep/delete
    // For simplicity in this implementation, we just pass the new files. 
    // A full implementation would pass a complex object detailing order and deletions.
    onImagesChange(newFiles);
  }, [items, onImagesChange]);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 10MB limit.`);
        return false;
      }
      return true;
    });

    if (items.length + validFiles.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      validFiles.splice(MAX_IMAGES - items.length);
    }

    const newItems = validFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'new',
      file,
      url: URL.createObjectURL(file),
      filename: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      isMain: items.length === 0 // Make first one main if list was empty
    }));

    setItems(prev => {
      const updated = [...prev, ...newItems];
      // Ensure at least one main image if items exist
      if (updated.length > 0 && !updated.some(i => i.isMain)) {
        updated[0].isMain = true;
      }
      return updated;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (idToRemove) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== idToRemove);
      // If we removed the main image, set the first remaining as main
      if (filtered.length > 0 && !filtered.some(i => i.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (idToSet) => {
    setItems(prev => prev.map(item => ({
      ...item,
      isMain: item.id === idToSet
    })));
  };

  // Simple Drag and Drop Reordering for the list
  const handleDragStartList = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDropList = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    setItems(prev => {
      const newItems = [...prev];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      return newItems;
    });
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple 
          accept={ALLOWED_TYPES.join(',')}
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drag & drop images here, or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">browse</button>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WEBP, GIF up to 10MB. Max {MAX_IMAGES} images.
            </p>
          </div>
        </div>
      </div>

      {/* Image List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-1">
            <span>{items.length} of {MAX_IMAGES} images uploaded</span>
            <span>Drag to reorder</span>
          </div>
          
          <div className="grid gap-3">
            {items.map((item, index) => (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStartList(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropList(e, index)}
                className={`flex items-center gap-4 p-3 bg-card border rounded-lg transition-all ${
                  item.isMain ? 'border-primary shadow-sm' : 'border-border'
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                  <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.filename}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {item.size && <span className="text-xs text-muted-foreground">{item.size}</span>}
                    {item.type === 'new' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">New</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Existing</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    type="button" 
                    variant={item.isMain ? "default" : "outline"} 
                    size="sm"
                    className={`h-8 text-xs ${item.isMain ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setMainImage(item.id)}
                  >
                    <Star className={`h-3.5 w-3.5 mr-1.5 ${item.isMain ? 'fill-current' : ''}`} />
                    {item.isMain ? 'Main Image' : 'Set Main'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => removeImage(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
