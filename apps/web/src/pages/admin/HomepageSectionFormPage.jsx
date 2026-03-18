
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const HomepageSectionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [section, setSection] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cta_text: '',
    cta_link: '',
    active: true,
    content: {}
  });

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const record = await api.get('/homepage/' + id);
        setSection(record);
        setFormData({
          title: record.title || '',
          subtitle: record.subtitle || '',
          description: record.description || '',
          cta_text: record.cta_text || '',
          cta_link: record.cta_link || '',
          active: record.active,
          content: record.content || {}
        });
      } catch (error) {
        console.error('Error fetching section:', error);
        toast.error('Failed to load section details');
        navigate('/admin-portal-secure-access/homepage-sections');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSection();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/homepage/' + id, formData);
      toast.success('Section updated successfully');
      navigate('/admin-portal-secure-access/homepage-sections');
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!section) return null;

  const renderSpecificFields = () => {
    switch (section.type) {
      case 'newsletter':
        return (
          <>
            <div className="space-y-2">
              <Label>Newsletter Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Newsletter Description</Label>
              <Textarea name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input name="cta_text" value={formData.cta_text} onChange={handleChange} />
            </div>
          </>
        );
      case 'color_grid':
        return (
          <>
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input name="subtitle" value={formData.subtitle} onChange={handleChange} />
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Colors are managed via JSON content for now.</p>
              <Textarea 
                value={JSON.stringify(formData.content, null, 2)} 
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData(p => ({...p, content: parsed}));
                  } catch (err) {
                    // ignore invalid json while typing
                  }
                }}
                className="font-mono text-xs min-h-[200px]"
              />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input name="subtitle" value={formData.subtitle} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>CTA Text</Label>
              <Input name="cta_text" value={formData.cta_text} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input name="cta_link" value={formData.cta_link} onChange={handleChange} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/admin-portal-secure-access/homepage-sections">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Edit Section</h1>
          <p className="text-sm text-muted-foreground">{section.title} ({section.type})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
        
        {renderSpecificFields()}

        <div className="flex items-center space-x-2 pt-4 border-t border-border">
          <Switch 
            id="active" 
            checked={formData.active} 
            onCheckedChange={(checked) => setFormData(p => ({...p, active: checked}))} 
          />
          <Label htmlFor="active" className="cursor-pointer">Active (visible on homepage)</Label>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin-portal-secure-access/homepage-sections">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            className="bg-[#C6A769] hover:bg-[#B59658] text-white min-w-[120px]"
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HomepageSectionFormPage;
