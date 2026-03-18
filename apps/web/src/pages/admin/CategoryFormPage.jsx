
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CategoryFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'category',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditing) return;
      try {
        const category = await api.get('/categories/' + id);
        setFormData({
          name: category.name || '',
          type: category.type || 'category',
        });
        if (category.image) {
          setImagePreview(category.image);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category details');
        navigate('/admin-portal-secure-access/categories');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCategory();
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

      if (isEditing) {
        await api.put('/categories/' + id, submitData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', submitData);
        toast.success('Category created successfully');
      }
      navigate('/admin-portal-secure-access/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/admin-portal-secure-access/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input 
              id="name" name="name" required 
              value={formData.name} onChange={handleChange}
              placeholder="e.g. Rings"
            />
          </div>

          <div className="space-y-2">
            <Label>Category Image</Label>
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
                <p className="text-xs text-muted-foreground mt-2">Recommended size: 800x800px (Square)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin-portal-secure-access/categories">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            className="bg-[#C6A769] hover:bg-[#B59658] text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Category</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryFormPage;
