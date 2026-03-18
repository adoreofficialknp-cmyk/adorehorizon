import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Loader2, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [storeForm, setStoreForm] = useState({
    storeName: '', storeEmail: '', storePhone: '',
    storeAddress: '', currency: 'INR', taxRate: 0,
    shippingCost: 0, freeShippingThreshold: 0, appDescription: '',
  });

  const [razorpayForm, setRazorpayForm] = useState({
    razorpay_key_id: '', razorpay_key_secret: '',
  });

  useEffect(() => {
    api.get('/settings').then((data) => {
      setStoreForm({
        storeName: data.storeName || '',
        storeEmail: data.storeEmail || '',
        storePhone: data.storePhone || '',
        storeAddress: data.storeAddress || '',
        currency: data.currency || 'INR',
        taxRate: data.taxRate || 0,
        shippingCost: data.shippingCost || 0,
        freeShippingThreshold: data.freeShippingThreshold || 0,
        appDescription: data.appDescription || '',
      });
      setRazorpayForm(prev => ({
        ...prev,
        razorpay_key_id: data.razorpayKeyId || '',
      }));
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleStoreChange = (field) => (e) => {
    setStoreForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const saveStoreSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings', storeForm);
      toast.success('Store settings saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveRazorpaySettings = async () => {
    if (!razorpayForm.razorpay_key_id.trim()) {
      toast.error('Razorpay Key ID is required');
      return;
    }
    if (!razorpayForm.razorpay_key_secret.trim() || razorpayForm.razorpay_key_secret === '••••••••') {
      toast.error('Razorpay Key Secret is required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/settings/razorpay', razorpayForm);
      toast.success('Razorpay credentials saved successfully');
      setRazorpayForm(prev => ({ ...prev, razorpay_key_secret: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to save Razorpay credentials');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-serif">Settings</h1>

      <Tabs defaultValue="store">
        <TabsList className="w-full">
          <TabsTrigger value="store" className="flex-1">Store</TabsTrigger>
          <TabsTrigger value="razorpay" className="flex-1">Razorpay</TabsTrigger>
          <TabsTrigger value="shipping" className="flex-1">Shipping</TabsTrigger>
        </TabsList>

        {/* ── Store Settings ── */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>General information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Store Name', field: 'storeName', placeholder: 'ADORE Jewellery' },
                { label: 'Store Email', field: 'storeEmail', placeholder: 'admin@store.com' },
                { label: 'Store Phone', field: 'storePhone', placeholder: '+91 98765 43210' },
                { label: 'Store Address', field: 'storeAddress', placeholder: 'Full address' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <Input placeholder={placeholder} value={storeForm[field]} onChange={handleStoreChange(field)} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Input value={storeForm.currency} onChange={handleStoreChange('currency')} />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" value={storeForm.taxRate} onChange={handleStoreChange('taxRate')} />
                </div>
              </div>
              <div>
                <Label>App Description</Label>
                <Input placeholder="Short description of your store" value={storeForm.appDescription} onChange={handleStoreChange('appDescription')} />
              </div>
              <Button onClick={saveStoreSettings} disabled={saving} className="w-full">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Store Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Razorpay Settings ── */}
        <TabsContent value="razorpay">
          <Card>
            <CardHeader>
              <CardTitle>Razorpay Payment Gateway</CardTitle>
              <CardDescription>
                Enter your Razorpay credentials. Keys are stored securely in the database.
                Get your keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" className="text-primary underline" rel="noreferrer">Razorpay Dashboard</a>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Key ID</Label>
                <Input
                  placeholder="rzp_live_xxxxxxxxxx or rzp_test_xxxxxxxxxx"
                  value={razorpayForm.razorpay_key_id}
                  onChange={(e) => setRazorpayForm(prev => ({ ...prev, razorpay_key_id: e.target.value }))}
                />
              </div>
              <div>
                <Label>Key Secret</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter new key secret to update"
                    value={razorpayForm.razorpay_key_secret}
                    onChange={(e) => setRazorpayForm(prev => ({ ...prev, razorpay_key_secret: e.target.value }))}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leave blank to keep existing secret</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Security note:</strong> Key Secret is stored encrypted. The current secret is never displayed — enter a new value only when rotating credentials.
              </div>
              <Button onClick={saveRazorpaySettings} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Razorpay Credentials</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Shipping Settings ── */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Shipping Cost (₹)</Label>
                <Input type="number" value={storeForm.shippingCost} onChange={handleStoreChange('shippingCost')} />
              </div>
              <div>
                <Label>Free Shipping Threshold (₹)</Label>
                <Input type="number" value={storeForm.freeShippingThreshold} onChange={handleStoreChange('freeShippingThreshold')} placeholder="e.g. 999" />
                <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping. Set 0 to disable.</p>
              </div>
              <Button onClick={saveStoreSettings} disabled={saving} className="w-full">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Shipping Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
