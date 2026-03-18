
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const SlideEditorModal = ({ isOpen, onClose, slide, sectionId, nextOrderIndex, onSaveSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    button_text: '',
    button_url: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (slide) {
        setFormData({
          heading: slide.heading || '',
          description: slide.description || '',
          button_text: slide.button_text || '',
          button_url: slide.button_url || ''
        });
      } else {
        setFormData({
          heading: '',
          description: '',
          button_text: '',
          button_url: ''
        });
      }
      setImageFile(null);
    }
  }, [isOpen, slide]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (slide?.id) {
        await api.put(`/homepage/${slide.id}`, data);
        toast.success('Slide updated successfully');
      } else {
        data.append('section_id', sectionId);
        data.append('slide_order', nextOrderIndex);
        await api.post('/homepage', data);
        toast.success('Slide created successfully');
      }
      
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Save slide error:', err);
      toast.error('Failed to save slide. Ensure homepage_slides collection exists.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{slide?.id ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Slide Image</Label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImageFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">Click or drag to upload</span>
                <span className="text-xs text-muted-foreground">Recommended: 1920x1080px</span>
              </div>
            </div>
            {imageFile && <p className="text-xs text-success mt-2">New image selected: {imageFile.name}</p>}
            {slide?.image && !imageFile && (
              <div className="mt-4 p-3 border rounded-lg bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Current Image:</p>
                <img src={slide.image} alt="Current Slide" className="h-32 rounded object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Heading</Label>
            <Input 
              value={formData.heading} 
              onChange={e => setFormData({...formData, heading: e.target.value})} 
              placeholder="e.g. Summer Collection 2026" 
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows={3} 
              placeholder="Brief description text for the slide" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input 
                value={formData.button_text} 
                onChange={e => setFormData({...formData, button_text: e.target.value})} 
                placeholder="e.g. Shop Now" 
              />
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input 
                value={formData.button_url} 
                onChange={e => setFormData({...formData, button_url: e.target.value})} 
                placeholder="e.g. /shop" 
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Slide'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlideEditorModal;
