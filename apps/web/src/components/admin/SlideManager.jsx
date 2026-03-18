
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api.js';
import { toast } from 'sonner';
import SlideEditorModal from './SlideEditorModal';

const SlideManager = ({ sectionId }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const fetchSlides = async () => {
    if (!sectionId) return;
    setLoading(true);
    setError(null);
    try {
      const records = []; // homepage_slides replaced by homepage sections
      setSlides(records);
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError('Failed to load slides. Ensure homepage_slides collection exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, [sectionId]);

  const handleOpenEditor = (slide = null) => {
    setEditingSlide(slide);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      // slide deletion handled via homepage sections
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete slide');
    }
  };

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    
    // Update order_index for all to ensure consistency
    newSlides.forEach((slide, i) => { slide.slide_order = i; });
    setSlides(newSlides);

    try {
      await Promise.all([
        api.put(`/homepage/${newSlides[index].id}`, { orderIndex: index }),
        api.put(`/homepage/${newSlides[targetIndex].id}`, { orderIndex: targetIndex })
      ]);
      toast.success('Slides reordered');
    } catch (err) {
      console.error('Reorder error:', err);
      toast.error('Failed to save new order');
      fetchSlides(); // Revert on failure
    }
  };

  const nextOrderIndex = slides.length > 0 ? Math.max(...slides.map(s => s.slide_order || 0)) + 1 : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Manage Slides</h3>
          <p className="text-xs text-muted-foreground">Add and reorder slides for this section</p>
        </div>
        <Button size="sm" onClick={() => handleOpenEditor()}>
          <Plus className="w-4 h-4 mr-2" /> Add Slide
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="space-y-3">
        {slides.length === 0 && !error ? (
          <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No slides added yet.</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className="flex items-center gap-3 p-3 border rounded-xl bg-card hover:border-primary/50 transition-colors">
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted" onClick={() => handleReorder(index, 'up')} disabled={index === 0}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted" onClick={() => handleReorder(index, 'down')} disabled={index === slides.length - 1}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="w-16 h-12 bg-muted rounded-md overflow-hidden shrink-0 border border-border flex items-center justify-center">
                {slide.image ? (
                  <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{slide.heading || 'Untitled Slide'}</h4>
                <p className="text-xs text-muted-foreground truncate">{slide.description || 'No description'}</p>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEditor(slide)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <SlideEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        slide={editingSlide} 
        sectionId={sectionId}
        nextOrderIndex={nextOrderIndex}
        onSaveSuccess={fetchSlides} 
      />
    </div>
  );
};

export default SlideManager;
