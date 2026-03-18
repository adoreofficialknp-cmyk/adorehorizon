import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { toast } from 'sonner';

const SECTION_TYPES = [
  { value: 'banner_slider',     label: 'Banner / Slider' },
  { value: 'festivals',         label: 'Festival Section' },
  { value: 'shop_by_color',     label: 'Shop by Color / Metal' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'custom_banner',     label: 'Custom Banner' },
];

/* ── Image upload helper ───────────────────── */
const ImagePicker = ({ value, onChange, label = 'Image', folder = 'homepage' }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await api.upload(`/upload?folder=adore-jewellery/${folder}`, fd);
      onChange(result.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <Label className="mb-1 block">{label}</Label>}
      <div className="flex gap-2 items-start">
        <Input
          placeholder="Paste URL or upload →"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm"
        />
        <Button type="button" variant="outline" size="sm"
          onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <img src={value} alt="" className="mt-2 h-20 w-auto rounded border object-cover" onError={e => e.target.style.display='none'} />
      )}
    </div>
  );
};

/* ── Section-type editors ─────────────────── */
const BannerSliderEditor = ({ data, onChange }) => {
  const banners = data?.banners || [];
  const add    = () => onChange({ ...data, banners: [...banners, { title: '', imageUrl: '', link: '' }] });
  const remove = (i) => onChange({ ...data, banners: banners.filter((_, idx) => idx !== i) });
  const update = (i, field, val) => onChange({ ...data, banners: banners.map((b, idx) => idx === i ? { ...b, [field]: val } : b) });

  return (
    <div className="space-y-3">
      {banners.map((b, i) => (
        <div key={i} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Slide {i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <Input placeholder="Slide title (optional)" value={b.title} onChange={e => update(i, 'title', e.target.value)} />
          <ImagePicker label="Slide Image" value={b.imageUrl} onChange={v => update(i, 'imageUrl', v)} folder="banners" />
          <Input placeholder="Link URL" value={b.link} onChange={e => update(i, 'link', e.target.value)} />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="mr-2 h-4 w-4" />Add Slide
      </Button>
    </div>
  );
};

const FestivalsEditor = ({ data, onChange }) => {
  const items = data?.items || [];
  const add    = () => onChange({ ...data, items: [...items, { title: '', image: '', link: '' }] });
  const remove = (i) => onChange({ ...data, items: items.filter((_, idx) => idx !== i) });
  const update = (i, field, val) => onChange({ ...data, items: items.map((it, idx) => idx === i ? { ...it, [field]: val } : it) });

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Festival {i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <Input placeholder="Festival name (e.g. Diwali Collection)" value={it.title} onChange={e => update(i, 'title', e.target.value)} />
          <ImagePicker label="Banner Image" value={it.image} onChange={v => update(i, 'image', v)} folder="festivals" />
          <Input placeholder="Link (e.g. /shop?festival=diwali)" value={it.link} onChange={e => update(i, 'link', e.target.value)} />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="mr-2 h-4 w-4" />Add Festival
      </Button>
    </div>
  );
};

const ShopByColorEditor = ({ data, onChange }) => {
  const items = data?.items || [];
  const add    = () => onChange({ ...data, items: [...items, { name: '', colorCode: '#FFD700', image: '', link: '' }] });
  const remove = (i) => onChange({ ...data, items: items.filter((_, idx) => idx !== i) });
  const update = (i, field, val) => onChange({ ...data, items: items.map((it, idx) => idx === i ? { ...it, [field]: val } : it) });

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Color {i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input placeholder="e.g. Gold" value={it.name} onChange={e => update(i, 'name', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={it.colorCode} onChange={e => update(i, 'colorCode', e.target.value)} className="h-9 w-10 rounded border cursor-pointer" />
                <Input value={it.colorCode} onChange={e => update(i, 'colorCode', e.target.value)} className="flex-1 text-xs" />
              </div>
            </div>
          </div>
          <ImagePicker label="Color/Swatch Image" value={it.image} onChange={v => update(i, 'image', v)} folder="colors" />
          <Input placeholder="Shop link (e.g. /shop?category=gold)" value={it.link} onChange={e => update(i, 'link', e.target.value)} />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="mr-2 h-4 w-4" />Add Color
      </Button>
    </div>
  );
};

const FeaturedProductsEditor = ({ data, onChange }) => (
  <div className="space-y-3">
    <div>
      <Label>Subtitle</Label>
      <Input placeholder="e.g. Handpicked for you" value={data?.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} />
    </div>
    <div>
      <Label>Number of Products</Label>
      <Input type="number" min={1} max={24} value={data?.displayCount || 8} onChange={e => onChange({ ...data, displayCount: parseInt(e.target.value) || 8 })} />
      <p className="text-xs text-muted-foreground mt-1">Products marked Featured in Product Manager appear automatically.</p>
    </div>
  </div>
);

const CustomBannerEditor = ({ data, onChange }) => (
  <div className="space-y-3">
    <Input placeholder="Banner title (optional)" value={data?.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} />
    <ImagePicker label="Banner Image" value={data?.imageUrl} onChange={v => onChange({ ...data, imageUrl: v })} folder="banners" />
    <Input placeholder="Redirect link (e.g. /shop)" value={data?.link || ''} onChange={e => onChange({ ...data, link: e.target.value })} />
  </div>
);

/* ── Main Modal ──────────────────────────── */
const SectionEditorModal = ({ section, onClose, onSave }) => {
  const isEdit = !!section;
  const [type,   setType]   = useState(section?.type  || 'banner_slider');
  const [title,  setTitle]  = useState(section?.title || '');
  const [active, setActive] = useState(section?.active ?? true);
  const [data,   setData]   = useState(section?.data  || {});
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (newType) => { setType(newType); setData({}); };

  const handleSave = async () => {
    if (!type) { toast.error('Select a section type'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/homepage/${section.id}`, { type, title, data, active });
        toast.success('Section updated');
      } else {
        await api.post('/homepage', { type, title, data, active });
        toast.success('Section created');
      }
      onSave();
    } catch (err) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    switch (type) {
      case 'banner_slider':     return <BannerSliderEditor     data={data} onChange={setData} />;
      case 'festivals':         return <FestivalsEditor         data={data} onChange={setData} />;
      case 'shop_by_color':     return <ShopByColorEditor       data={data} onChange={setData} />;
      case 'featured_products': return <FeaturedProductsEditor  data={data} onChange={setData} />;
      case 'custom_banner':     return <CustomBannerEditor      data={data} onChange={setData} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-xl font-bold font-serif">{isEdit ? 'Edit Section' : 'Add Section'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div>
            <Label>Section Type *</Label>
            <select value={type} onChange={e => handleTypeChange(e.target.value)}
              disabled={isEdit}
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500">
              {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {isEdit && <p className="text-xs text-muted-foreground mt-1">Type cannot be changed after creation.</p>}
          </div>

          <div>
            <Label>Section Title (shown to visitors)</Label>
            <Input placeholder="e.g. Festival Collections" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-sm">{active ? '✅ Visible on homepage' : '🔒 Hidden from homepage'}</span>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Content</p>
            {renderEditor()}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (isEdit ? 'Update Section' : 'Create Section')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionEditorModal;
