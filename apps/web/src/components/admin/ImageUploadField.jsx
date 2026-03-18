
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploadField = ({ label, onChange, existingUrl, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(existingUrl || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(existingUrl || null);
  }, [existingUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFile = (file) => {
    setError(null);
    
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, GIF, or WEBP.');
      toast.error('Invalid file type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 20MB.');
      toast.error('File exceeds 20MB limit');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndProcessFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndProcessFile(file);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClear) onClear();
    else onChange(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden group
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
          ${preview ? 'p-2' : 'p-8'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {preview ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleClear}>
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click or drag image to upload</p>
              <p className="text-xs mt-1">JPG, PNG, GIF, WEBP up to 20MB</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
