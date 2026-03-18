import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Loader2, AlertCircle,
  GripVertical, ToggleLeft, ToggleRight, Eye
} from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { toast } from 'sonner';
import SectionEditorModal from '@/components/admin/SectionEditorModal.jsx';

const TYPE_LABELS = {
  banner_slider:     { label: 'Banner / Slider',     color: 'bg-blue-100 text-blue-800' },
  festivals:         { label: 'Festival Section',     color: 'bg-orange-100 text-orange-800' },
  shop_by_color:     { label: 'Shop by Color/Metal',  color: 'bg-purple-100 text-purple-800' },
  featured_products: { label: 'Featured Products',    color: 'bg-green-100 text-green-800' },
  custom_banner:     { label: 'Custom Banner',        color: 'bg-pink-100 text-pink-800' },
};

const AdminHomepageBuilder = () => {
  const [sections, setSections]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/homepage?all=true');
      setSections(data);
    } catch (err) {
      setError('Failed to load homepage sections.');
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section? This cannot be undone.')) return;
    try {
      await api.delete(`/homepage/${id}`);
      toast.success('Section deleted');
      fetchSections();
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await api.put(`/homepage/${section.id}`, { active: !section.active });
      toast.success(section.active ? 'Section hidden' : 'Section visible');
      fetchSections();
    } catch {
      toast.error('Failed to update section');
    }
  };

  const handleReorder = async (id, direction) => {
    const idx = sections.findIndex(s => s.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sections.length - 1) return;

    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];

    const updates = newSections.map((s, i) => ({ id: s.id, orderIndex: i }));
    try {
      await api.put('/homepage/reorder/bulk', { sections: updates });
      setSections(newSections);
    } catch {
      toast.error('Failed to reorder sections');
    }
  };

  const handleEditorSave = () => {
    setIsEditorOpen(false);
    setEditingSection(null);
    fetchSections();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Loading sections…</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 text-destructive p-6">
      <AlertCircle className="h-5 w-5" />
      <span>{error}</span>
      <Button variant="outline" size="sm" onClick={fetchSections}>Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif">Homepage Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and reorder homepage sections. All media is stored on Cloudinary.
          </p>
        </div>
        <Button onClick={() => { setEditingSection(null); setIsEditorOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Sections list */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">No homepage sections yet.</p>
            <Button onClick={() => setIsEditorOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Add your first section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const typeInfo = TYPE_LABELS[section.type] || { label: section.type, color: 'bg-gray-100 text-gray-800' };
            return (
              <Card
                key={section.id}
                className={`transition-opacity ${section.active ? '' : 'opacity-60'}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(section.id, 'up')}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                      title="Move up"
                    >▲</button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => handleReorder(section.id, 'down')}
                      disabled={idx === sections.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                      title="Move down"
                    >▼</button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{section.title || '(Untitled)'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Order #{idx + 1} · ID: {section.id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{section.active ? 'Visible' : 'Hidden'}</span>
                      <Switch
                        checked={section.active}
                        onCheckedChange={() => handleToggleActive(section)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingSection(section); setIsEditorOpen(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Section Editor Modal */}
      {isEditorOpen && (
        <SectionEditorModal
          section={editingSection}
          onClose={() => { setIsEditorOpen(false); setEditingSection(null); }}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
};

export default AdminHomepageBuilder;
