
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    stock: '10',
    is_new: false,
    is_best_seller: false,
    is_sale: false,
    color: '',
    material: '',
    gender: 'Women'
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catsData = await api.get('/categories');
        setCategories(Array.isArray(catsData) ? catsData : catsData.items || []);

        if (isEdit) {
          const product = await api.get(`/products/${id}`);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            original_price: product.comparePrice?.toString() || '',
            category: product.categoryId || '',
            stock: product.stock?.toString() || '0',
            is_new: (product.is_new) || false,
            is_best_seller: product.featured || product.is_best_seller || false,
            is_sale: product.is_sale || false,
            color: product.color || '',
            material: product.material || '',
            gender: product.gender || 'Women'
          });

          // Images are now Cloudinary URLs stored in product.images[]
          const imagesToLoad = (product.images || []).map(url => ({ name: url, url, field: 'images' }));
          setExistingImages(imagesToLoad);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 20MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} image(s) ready for upload.`);
    }
    
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeExistingImage = async (imageName) => {
    if (!isEdit) return;
    try {
      setExistingImages(prev => prev.filter(img => img.name !== imageName));
      toast.info('Image marked for removal. Save to apply changes.');
    } catch (error) {
      console.error(error);
    }
  };

  const saveProductWithRetry = async (formPayload, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (attempt > 0) setRetryCount(attempt + 1);

        // 1. Upload new images to Cloudinary first
        const uploadedUrls = [];
        for (const file of newImages) {
          const fd = new FormData();
          fd.append('file', file);
          const res = await api.upload('/upload/product-image', fd);
          uploadedUrls.push(res.url);
        }

        // 2. Build clean JSON payload (not FormData)
        const keepUrls = existingImages.map(img => img.url);
        const allImages = [...keepUrls, ...uploadedUrls];

        const payload = {
          name: formPayload.name,
          description: formPayload.description,
          price: parseFloat(formPayload.price),
          comparePrice: formPayload.original_price ? parseFloat(formPayload.original_price) : null,
          categoryId: formPayload.category || null,
          stock: parseInt(formPayload.stock) || 0,
          featured: formPayload.is_best_seller || false,
          color: formPayload.color || null,
          images: allImages,
          active: true,
        };

        if (isEdit) {
          return await api.put(`/products/${id}`, payload);
        } else {
          return await api.post('/products', payload);
        }
      } catch (error) {
        console.error(`Save attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setRetryCount(0);

    try {
      const record = await saveProductWithRetry(formData);
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      setNewImages([]);
      setImagePreviews([]);

      if (!isEdit) {
        navigate('/admin-portal-secure-access/products');
      } else {
        const imagesToLoad = (record.images || []).map(url => ({ name: url, url, field: 'images' }));
        setExistingImages(imagesToLoad);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save product. Please try again.');
      toast.error(error.message || 'Failed to save product. Please try again.');
    } finally {
      setSaving(false);
      setRetryCount(0);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = 'https://placehold.co/400x500/f3f4f6/a1a1aa?text=Image+Error';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link to="/admin-portal-secure-access/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update product details and manage images.' : 'Create a new product listing.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={handleSubmit} disabled={saving}>
              <RefreshCw className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
              Retry Save
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {retryCount > 0 ? `Retrying (${retryCount})...` : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Error saving product</h4>
            <p className="text-sm opacity-90 mt-1">{saveError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  disabled={saving}
                  placeholder="e.g. Diamond Eternity Ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={5} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  disabled={saving}
                  placeholder="Detailed product description..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    required 
                    min="0" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input 
                    id="original_price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.original_price} 
                    onChange={e => setFormData({...formData, original_price: e.target.value})} 
                    disabled={saving}
                    placeholder="For strike-through sale pricing"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Product Images</CardTitle>
              <CardDescription>Upload high-quality images. Max 20MB per file. Supported formats: JPG, PNG, GIF, WebP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${saving ? 'border-muted bg-muted/10 opacity-50' : 'border-border hover:bg-muted/30 hover:border-primary/50'}`}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  onChange={handleImageChange}
                  disabled={saving}
                  title="Click or drag to upload images"
                />
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-base font-medium text-foreground">Click or drag images to upload</p>
                <p className="text-sm text-muted-foreground mt-1">You can select multiple files at once</p>
              </div>

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-medium text-foreground">Image Gallery</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                      <div key={`ext-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-border group bg-muted">
                        <img src={img.url} alt="Product" onError={handleImageError} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExistingImage(img.name)}
                            disabled={saving}
                            className="h-8"
                          >
                            <X className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* New Image Previews */}
                    {imagePreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20 group bg-muted">
                        <img src={preview.url} alt="New upload" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary text-primary-foreground border-none shadow-sm">New</Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate text-center backdrop-blur-sm">
                          {formatBytes(preview.size)}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeNewImage(idx)}
                            disabled={saving}
                            className="h-8"
                          >
                            <X className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Rose Gold" disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} placeholder="e.g. 18k Gold" disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity *</Label>
                <Input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} disabled={saving} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Status & Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_new" className="cursor-pointer flex-1">Mark as New</Label>
                <Switch id="is_new" checked={formData.is_new} onCheckedChange={v => setFormData({...formData, is_new: v})} disabled={saving} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_best_seller" className="cursor-pointer flex-1">Best Seller</Label>
                <Switch id="is_best_seller" checked={formData.is_best_seller} onCheckedChange={v => setFormData({...formData, is_best_seller: v})} disabled={saving} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_sale" className="cursor-pointer flex-1">On Sale</Label>
                <Switch id="is_sale" checked={formData.is_sale} onCheckedChange={v => setFormData({...formData, is_sale: v})} disabled={saving} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;
