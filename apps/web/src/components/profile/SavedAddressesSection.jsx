import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';

const LOCAL_KEY = 'adore_saved_addresses';

const getSaved = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
};
const persistSaved = (addresses) => localStorage.setItem(LOCAL_KEY, JSON.stringify(addresses));

const emptyForm = { label: '', line1: '', city: '', state: '', pincode: '', phone: '', isDefault: false };

const SavedAddressesSection = () => {
  const [addresses, setAddresses]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);

  useEffect(() => { setAddresses(getSaved()); }, []);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (addr) => { setForm(addr); setEditing(addr.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.line1.trim() || !form.city.trim()) {
      toast.error('Address line and city are required');
      return;
    }
    let updated;
    if (editing) {
      updated = addresses.map(a => a.id === editing ? { ...form, id: editing } : a);
    } else {
      const newAddr = { ...form, id: Date.now().toString() };
      if (form.isDefault) {
        updated = [...addresses.map(a => ({ ...a, isDefault: false })), newAddr];
      } else {
        updated = [...addresses, newAddr];
      }
    }
    persistSaved(updated);
    setAddresses(updated);
    setShowForm(false);
    toast.success(editing ? 'Address updated' : 'Address saved');
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    persistSaved(updated);
    setAddresses(updated);
    toast.success('Address removed');
  };

  const setDefault = (id) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    persistSaved(updated);
    setAddresses(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Saved Addresses</h3>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add New</Button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-10 text-muted-foreground border rounded-lg">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No saved addresses yet</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map(addr => (
          <div key={addr.id} className={`border rounded-lg p-4 relative ${addr.isDefault ? 'border-primary bg-primary/5' : ''}`}>
            {addr.isDefault && (
              <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Default</span>
            )}
            <p className="font-medium">{addr.label || 'Address'}</p>
            <p className="text-sm text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
            {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => openEdit(addr)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
              {!addr.isDefault && (
                <Button size="sm" variant="outline" onClick={() => setDefault(addr.id)}><Check className="h-3 w-3 mr-1" />Set Default</Button>
              )}
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(addr.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <h4 className="font-medium">{editing ? 'Edit Address' : 'Add Address'}</h4>
          {[
            { label: 'Label (e.g. Home)', field: 'label', placeholder: 'Home' },
            { label: 'Street Address *', field: 'line1', placeholder: '123 Main St, Flat 4B' },
            { label: 'City *', field: 'city', placeholder: 'Mumbai' },
            { label: 'State', field: 'state', placeholder: 'Maharashtra' },
            { label: 'Pincode', field: 'pincode', placeholder: '400001' },
            { label: 'Phone', field: 'phone', placeholder: '9876543210' },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <Label>{label}</Label>
              <Input placeholder={placeholder} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
            <span className="text-sm">Set as default address</span>
          </label>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">Save Address</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddressesSection;
