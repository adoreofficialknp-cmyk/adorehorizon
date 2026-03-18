import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useContext(AuthContext);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const coupons = []; // Coupons are admin-only; coupon is applied at checkout via /coupons/apply

      if (coupons.length === 0) {
        toast.error('Invalid coupon code');
        return;
      }

      const coupon = coupons[0];
      
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        toast.error('Coupon has expired');
        return;
      }

      if (coupon.minimum_purchase && subtotal < coupon.minimum_purchase) {
        toast.error(`Minimum purchase of ₹${coupon.minimum_purchase} required`);
        return;
      }

      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (subtotal * coupon.discount_value) / 100;
      } else {
        discountAmount = coupon.discount_value;
      }

      setDiscount(discountAmount);
      toast.success('Coupon applied successfully');
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Helmet>
          <title>Shopping Cart - ADORE Jewellery</title>
          <meta name="description" content="View your shopping cart at ADORE Jewellery" />
        </Helmet>

        <Header />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center w-full pb-[90px]">
          <ShoppingBag className="h-20 w-20 md:h-24 md:w-24 mx-auto text-muted-foreground mb-6" />
          <h1 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            Start shopping to add items to your cart
          </p>
          <Link to="/shop">
            <Button size="lg" className="touch-target px-8 w-full sm:w-auto h-14 text-lg">Continue Shopping</Button>
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Helmet>
        <title>Shopping Cart - ADORE Jewellery</title>
        <meta name="description" content="View your shopping cart at ADORE Jewellery" />
      </Helmet>

      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full pb-[90px]">
        <h1 
          className="text-2xl md:text-4xl font-bold mb-6 md:mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Shopping cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 w-full">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.selectedSize || 'default'}`} className="bg-card rounded-xl p-4 md:p-6 border border-border w-full">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full">
                  <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4 w-full">
                      <div className="w-full sm:w-auto">
                        <Link to={`/product/${item.id}`} className="font-medium hover:text-primary transition-colors duration-200 line-clamp-2 text-base md:text-lg">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{item.price.toLocaleString()} each
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Size: {item.selectedSize}
                          </p>
                        )}
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        <p className="font-bold text-lg">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-auto pt-4 border-t sm:border-none border-border w-full">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 sm:h-10 sm:w-10 touch-target"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-10 text-center text-base font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 sm:h-10 sm:w-10 touch-target"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 touch-target h-12 px-4"
                      >
                        <Trash2 className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 w-full">
            <div className="bg-card rounded-xl p-5 md:p-6 border border-border sticky top-24 w-full">
              <h2 className="text-xl font-semibold mb-6">Order summary</h2>

              {/* Coupon */}
              <div className="mb-6 w-full">
                <Label htmlFor="coupon" className="mb-2 block">Coupon code</Label>
                <div className="flex gap-2 w-full">
                  <Input
                    id="coupon"
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="text-foreground touch-target w-full h-12"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon} className="touch-target h-12 px-6">
                    Apply
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 mb-6 w-full">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full touch-target text-lg h-14 font-medium"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              <Link to="/shop" className="block mt-4 w-full">
                <Button variant="ghost" className="w-full touch-target h-14 text-base">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;