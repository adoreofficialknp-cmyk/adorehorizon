import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '@/contexts/CartContext.jsx';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Loader2, ShoppingBag, CreditCard, Truck, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [errors, setErrors] = useState({});

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const finalTotal = cartTotal - discount + shippingCost;

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const result = await api.post('/coupons/apply', { code: couponCode, cart_total: cartTotal });
      setDiscount(result.discount_amount);
      setAppliedCoupon(result.coupon);
      toast.success(`Coupon applied! Saved ₹${result.discount_amount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    if (!validateForm()) { toast.error('Please fill all required fields'); return; }
    if (!cartItems.length) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const shippingAddress = {
        line1: form.address, city: form.city, state: form.state, pincode: form.pincode,
      };

      // Create app order
      const orderResult = await api.post('/checkout/create-order', {
        items: cartItems,
        customer_info: { name: form.name, email: form.email, phone: form.phone, address: shippingAddress },
        payment_method: paymentMethod,
        total_amount: cartTotal,        // subtotal before discount/shipping — backend computes final
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discount,
        shipping_cost: shippingCost,
      });

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/order-success/${orderResult.order_id}`);
        return;
      }

      // Razorpay flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) { toast.error('Razorpay failed to load. Try refreshing.'); setLoading(false); return; }

      const rzpOrder = await api.post('/payment/razorpay-order', {
        order_id: orderResult.order_id,
        amount: finalTotal,
        customer_email: form.email,
        customer_phone: form.phone,
      });

      const options = {
        key: rzpOrder.razorpay_key_id,
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'ADORE Jewellery',
        description: `Order ${orderResult.order_id}`,
        order_id: rzpOrder.razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#b45309' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify-razorpay', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderResult.order_id,
            });
            clearCart();
            navigate(`/order-success/${orderResult.order_id}`);
          } catch {
            toast.error('Payment verification failed. Contact support with your payment ID.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-40" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')}>Browse Products</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold font-serif mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />Shipping Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={form.name} onChange={handleChange('name')} />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input value={form.phone} onChange={handleChange('phone')} />
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={handleChange('email')} />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input placeholder="Street address, building, flat no." value={form.address} onChange={handleChange('address')} />
                  {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input value={form.city} onChange={handleChange('city')} />
                    {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={form.state} onChange={handleChange('state')} />
                  </div>
                  <div>
                    <Label>Pincode *</Label>
                    <Input value={form.pincode} onChange={handleChange('pincode')} maxLength={6} />
                    {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { value: 'razorpay', label: 'Pay Online (UPI / Card / Net Banking)', icon: '💳' },
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <input type="radio" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-primary" />
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="h-12 w-12 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCost}`}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
                </div>

                {/* Coupon */}
                <div className="border-t pt-3">
                  <Label className="flex items-center gap-1"><Tag className="h-4 w-4" />Coupon Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} />
                    <Button size="sm" variant="outline" onClick={applyCoupon} disabled={applyingCoupon || !!appliedCoupon}>
                      {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-green-600 text-xs mt-1">✓ {appliedCoupon.code} applied — saved ₹{discount.toFixed(2)}</p>
                  )}
                </div>

                <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${finalTotal.toLocaleString()}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
