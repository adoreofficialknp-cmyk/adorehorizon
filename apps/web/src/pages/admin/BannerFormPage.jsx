import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';

const BannerFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const fileRef = useRef();

  const [loading, setLoading]           = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [uploading, setUploading]       = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl]         = useState(''); // final Cloudinary URL

  const [formData, setFormData] = useState({
    title: '', link: '', type: 'slider', position: 'top',
    orderIndex: 0, active: true,
  });

  useEffect(() => {
    if (!isEditing) return;
    api.get('/banners/' + id)
      .then(banner => {
        setFormData({
          title:      banner.title      || '',
          link:       banner.link       || '',
          type:       banner.type       || 'slider',
          position:   banner.position   || 'top',
          orderIndex: banner.orderIndex || 0,
          active:     banner.active     !== false,
        });
        if (banner.imageUrl) { setImagePreview(banner.imageUrl); setImageUrl(banner.imageUrl); }
      })
      .catch(() => { toast.error('Failed to load banner'); navigate('/admin-portal-secure-access/banners'); })
      .finally(() => setInitialLoading(false));
  }, [id, isEditing, navigate]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await api.upload('/upload/banner-image', fd);
      setImageUrl(result.url);
      toast.success('Image uploaded to Cloudinary');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) { toast.error('Please upload a banner image'); return; }

    setLoading(true);
    try {
      const payload = { ...formData, imageUrl };
      if (isEditing) {
        await api.put('/banners/' + id, payload);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created');
      }
      navigate('/admin-portal-secure-access/banners');
    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete('/banners/' + id);
      toast.success('Banner deleted');
      navigate('/admin-portal-secure-access/banners');
    } catch { toast.error('Failed to delete banner'); }
  };

  if (initialLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/admin-portal-secure-access/banners"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-serif font-bold">{isEditing ? 'Edit Banner' : 'Add Banner'}</h1>
        </div>
        {isEditing && <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
        <div>
          <Label>Banner Image *</Label>
          <div className="mt-2">
            {imagePreview ? (
              <div className="relative w-full aspect-[21/9] rounded-lg border overflow-hidden mb-3 bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="text-white ml-2">Uploading to Cloudinary...</span>
                  </div>
                )}
                {!uploading && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100">
                    Replace Image
                  </button>
                )}
              </div>
            ) : (
              <label className="w-full aspect-[21/9] rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-muted/30 hover:bg-muted cursor-pointer">
                {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />}
                <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload banner image'}</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — uploads to Cloudinary</span>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        <div>
          <Label>Banner Title</Label>
          <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Summer Sale 2025" className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="slider">Slider</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Position</Label>
            <Select value={formData.position} onValueChange={v => setFormData(p => ({ ...p, position: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="mid">Mid Page</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Link URL</Label>
          <Input value={formData.link} onChange={e => setFormData(p => ({ ...p, link: e.target.value }))} placeholder="/shop?category=gold" className="mt-1" />
        </div>

        <div>
          <Label>Display Order</Label>
          <Input type="number" value={formData.orderIndex} onChange={e => setFormData(p => ({ ...p, orderIndex: parseInt(e.target.value) || 0 }))} className="mt-1 w-32" />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={formData.active} onCheckedChange={v => setFormData(p => ({ ...p, active: v }))} />
          <Label>Active (visible on site)</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" asChild><Link to="/admin-portal-secure-access/banners">Cancel</Link></Button>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]" disabled={loading || uploading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Banner</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BannerFormPage;
