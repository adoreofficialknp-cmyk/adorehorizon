
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api.js';

const OrderSummary = ({ cartItems, subtotal, discount, total, shipping = 0, taxes = 0 }) => {
  return (
    <Card className="bg-[hsl(var(--checkout-sidebar))] border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Itemized List */}
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                    No Img
                  </div>
                )}
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center z-10">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{(item.price || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right flex flex-col justify-center">
                <p className="text-sm font-medium">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
          </div>
          
          {shipping > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">₹{shipping.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
          )}

          {taxes > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Taxes</span>
              <span className="font-medium">₹{taxes.toLocaleString()}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">-₹{discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
