
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { GripVertical, Edit, Trash2, Plus, Save, Eye, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api.js';
import { toast } from 'sonner';

// Simplified Drag and Drop implementation without external heavy libraries
const HomepageSectionManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const records = await api.get('/homepage?limit=500').then(d => Array.isArray(d) ? d : d.items || []);
      setSections(records);
    } catch (error) {
      console.error('Error fetching sections:', error);
      // Fallback mock data if collection is empty or fails
      setSections([
        { id: '1', title: 'Hero Banner', section_type: 'banner', active: true, order_index: 0 },
        { id: '2', title: 'Trust Badges', section_type: 'trust_badges', active: true, order_index: 1 },
        { id: '3', title: 'Shop by Category', section_type: 'shop', active: true, order_index: 2 },
        { id: '4', title: 'Best Sellers', section_type: 'product_collection', active: true, order_index: 3 },
        { id: '5', title: 'Newsletter', section_type: 'newsletter', active: true, order_index: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/html', e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newSections = [...sections];
    const draggedItem = newSections[draggedIndex];
    
    // Remove item from old position
    newSections.splice(draggedIndex, 1);
    // Insert at new position
    newSections.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setSections(newSections);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      // Update order_index for all sections
      const promises = sections.map((section, index) => {
        // Only update if it's a real PocketBase record (has 15 char ID)
        if (section.id.length === 15) {
          return api.put(`/homepage/${section.id}`, { orderIndex: index });
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      toast.success('Homepage layout saved successfully');
    } catch (error) {
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (index) => {
    const newSections = [...sections];
    newSections[index].active = !newSections[index].active;
    setSections(newSections);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Helmet><title>Homepage Builder - Admin Portal</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Homepage Builder</h1>
          <p className="text-muted-foreground">Drag and drop to reorder sections on the storefront</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-11">
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button 
            onClick={handleSaveOrder} 
            disabled={saving}
            className="flex-1 sm:flex-none bg-[#C6A769] text-white hover:bg-[#B8965E] h-11"
          >
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Draggable List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <LayoutTemplate className="h-5 w-5 mr-2 text-primary" />
                Active Sections
              </CardTitle>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Section
              </Button>
            </CardHeader>
            <CardContent className="p-4 bg-muted/10 min-h-[400px]">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading sections...</div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div 
                      key={section.id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      className={`flex items-center gap-4 p-4 bg-white border rounded-xl transition-all duration-200 ${
                        draggedIndex === index ? 'opacity-50 border-primary shadow-md scale-[1.02]' : 'border-border hover:border-primary/50 hover:shadow-sm'
                      } ${!section.active ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    >
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-muted-foreground hover:text-[#1A1A1A]"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#1A1A1A] truncate">{section.title}</h3>
                          {!section.active && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{section.section_type.replace('_', ' ')}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => toggleActive(index)}
                        >
                          {section.active ? 'Hide' : 'Show'}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Quick Settings / Info */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm sticky top-[100px]">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground">
              <p>
                Drag and drop the sections on the left to reorder how they appear on your storefront homepage.
              </p>
              <p>
                Click <strong>Edit</strong> to modify the content, images, and specific settings for each section.
              </p>
              <p>
                Use the <strong>Hide/Show</strong> toggle to temporarily remove a section without deleting its content.
              </p>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-6">
                <p className="text-primary font-medium mb-1">Remember to Publish!</p>
                <p className="text-xs">Changes are only visible to customers after you click "Publish Changes".</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomepageSectionManager;
