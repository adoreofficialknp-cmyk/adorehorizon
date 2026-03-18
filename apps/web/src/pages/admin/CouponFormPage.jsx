
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CouponFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_purchase: '',
    max_discount_cap: '',
    expiry_date: '',
    usage_limit_total: '',
    usage_limit_per_customer: '',
    active_status: true,
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!isEditing) return;
      try {
        const coupon = await api.get('/coupons/' + id);
        setFormData({
          code: coupon.code || '',
          discount_type: coupon.discount_type || 'percentage',
          discount_value: coupon.discount_value || '',
          minimum_purchase: coupon.minimum_purchase || '',
          max_discount_cap: coupon.max_discount_cap || '',
          expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '',
          usage_limit_total: coupon.usage_limit_total || '',
          usage_limit_per_customer: coupon.usage_limit_per_customer || '',
          active_status: coupon.active_status,
        });
      } catch (error) {
        console.error('Error fetching coupon:', error);
        toast.error('Failed to load coupon details');
        navigate('/admin-portal-secure-access/coupons');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCoupon();
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'code') {
      // Alphanumeric, no spaces, uppercase
      const formatted = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check uniqueness if new or code changed
      if (!isEditing) {
        const existing = await api.get('/coupons?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.items || [], totalPages: d.totalPages || 1 }));
        if (existing.items.length > 0) {
          throw new Error('Coupon code already exists');
        }
      }

      const submitData = {
        ...formData,
        // Map frontend field names to backend schema field names
        discountType:  formData.discount_type,
        discountValue: Number(formData.discount_value),
        minOrderAmount: formData.minimum_purchase ? Number(formData.minimum_purchase) : 0,
        maxUses: formData.usage_limit_total ? Number(formData.usage_limit_total) : null,
        active: formData.active_status !== false,
        expiresAt: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };

      if (isEditing) {
        await api.put('/coupons/' + id, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', submitData);
        toast.success('Coupon created successfully');
      }
      navigate('/admin-portal-secure-access/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete('/coupons/' + id);
      toast.success('Coupon deleted successfully');
      navigate('/admin-portal-secure-access/coupons');
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/admin-portal-secure-access/coupons">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">
            {isEditing ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
        </div>
        {isEditing && (
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input 
              id="code" name="code" required 
              value={formData.code} onChange={handleChange}
              placeholder="e.g. SUMMER20"
              className="uppercase font-mono"
            />
            <p className="text-xs text-muted-foreground">Alphanumeric only, no spaces.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input 
              id="expiry_date" name="expiry_date" type="date"
              value={formData.expiry_date} onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_type">Discount Type *</Label>
            <Select 
              value={formData.discount_type} 
              onValueChange={(val) => setFormData(p => ({...p, discount_type: val}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_value">Discount Value *</Label>
            <Input 
              id="discount_value" name="discount_value" type="number" step="0.01" required 
              value={formData.discount_value} onChange={handleChange}
              placeholder={formData.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_purchase">Minimum Purchase Amount (₹)</Label>
            <Input 
              id="minimum_purchase" name="minimum_purchase" type="number" step="0.01"
              value={formData.minimum_purchase} onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          {formData.discount_type === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="max_discount_cap">Maximum Discount Cap (₹)</Label>
              <Input 
                id="max_discount_cap" name="max_discount_cap" type="number" step="0.01"
                value={formData.max_discount_cap} onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usage_limit_total">Total Usage Limit</Label>
            <Input 
              id="usage_limit_total" name="usage_limit_total" type="number"
              value={formData.usage_limit_total} onChange={handleChange}
              placeholder="Optional (e.g. 100 uses total)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_limit_per_customer">Usage Limit Per Customer</Label>
            <Input 
              id="usage_limit_per_customer" name="usage_limit_per_customer" type="number"
              value={formData.usage_limit_per_customer} onChange={handleChange}
              placeholder="Optional (e.g. 1 use per person)"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t border-border">
          <Switch 
            id="active_status" 
            checked={formData.active_status} 
            onCheckedChange={(checked) => setFormData(p => ({...p, active_status: checked}))} 
          />
          <Label htmlFor="active_status" className="cursor-pointer">Active (can be used by customers)</Label>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin-portal-secure-access/coupons">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            className="bg-[#C6A769] hover:bg-[#B59658] text-white min-w-[120px]"
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Coupon</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponFormPage;
