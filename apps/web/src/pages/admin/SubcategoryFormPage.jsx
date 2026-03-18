
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SubcategoryFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await api.get('/categories?limit=500').then(d => Array.isArray(d) ? d : d.items || []);
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchSubcategory = async () => {
      if (!isEditing) return;
      try {
        const sub = await api.get('/categories/subcategories/' + id);
        setFormData({
          name: sub.name || '',
          category_id: sub.category_id || '',
          description: sub.description || '',
        });
        if (sub.image) {
          setImagePreview(sub.image);
        }
      } catch (error) {
        console.error('Error fetching subcategory:', error);
        toast.error('Failed to load subcategory details');
        navigate('/admin-portal-secure-access/subcategories');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategories();
    fetchSubcategory();
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await api.upload('/upload?folder=adore-jewellery/categories', fd);
      setImageUrl(result.url);
    } catch (err) {
      toast.error('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {};
      Object.keys(formData).forEach(key => { submitData[key] = formData[key]; });
      if (imageUrl) submitData.imageUrl = imageUrl;
      // Map category_id (form field) to categoryId (backend field)
      submitData.categoryId = formData.category_id || formData.categoryId || '';

      if (isEditing) {
        await api.put('/categories/subcategories/' + id, submitData);
        toast.success('Subcategory updated successfully');
      } else {
        await api.post('/categories/' + submitData.categoryId + '/subcategories', submitData);
        toast.success('Subcategory created successfully');
      }
      navigate('/admin-portal-secure-access/subcategories');
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/admin-portal-secure-access/subcategories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">
          {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subcategory Name *</Label>
            <Input 
              id="name" name="name" required 
              value={formData.name} onChange={handleChange}
              placeholder="e.g. Engagement Rings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Parent Category *</Label>
            <select 
              id="category_id" name="category_id" required
              value={formData.category_id} onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Parent Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" name="description" 
              value={formData.description} onChange={handleChange}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label>Subcategory Image</Label>
            <div className="flex items-center gap-6">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                  <UploadCloud className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
              )}
              <div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin-portal-secure-access/subcategories">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            className="bg-[#C6A769] hover:bg-[#B59658] text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Subcategory</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubcategoryFormPage;
