/**
 * Generate unique order ID  e.g. ORD-20241201-ABC123
 */
export const generateOrderId = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${datePart}-${random}`;
};

/**
 * Calculate discount from coupon
 */
export const calculateDiscount = (cartTotal, coupon) => {
  if (coupon.discountType === 'percentage') {
    return Math.min((cartTotal * coupon.discountValue) / 100, cartTotal);
  }
  if (coupon.discountType === 'fixed') {
    return Math.min(coupon.discountValue, cartTotal);
  }
  return 0;
};

/**
 * Validate coupon against cart total
 */
export const validateCoupon = (coupon, cartTotal) => {
  if (!coupon.active) return { valid: false, error: 'Coupon is not active' };

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'Coupon has expired' };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
    };
  }

  return { valid: true };
};
