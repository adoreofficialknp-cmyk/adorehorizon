
import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const PaymentMethodSelector = ({ selectedMethod, onSelectMethod }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
      <RadioGroup value={selectedMethod} onValueChange={onSelectMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Razorpay Option */}
        <div>
          <RadioGroupItem value="razorpay" id="razorpay" className="peer sr-only" />
          <Label
            htmlFor="razorpay"
            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
          >
            <Wallet className="mb-3 h-6 w-6 text-primary" />
            <span className="font-semibold">Razorpay</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">
              UPI, Cards, NetBanking, Wallets
            </span>
          </Label>
        </div>

        {/* Stripe Option */}
        <div>
          <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
          <Label
            htmlFor="stripe"
            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
          >
            <CreditCard className="mb-3 h-6 w-6 text-primary" />
            <span className="font-semibold">Stripe</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">
              International Cards, Apple Pay
            </span>
          </Label>
        </div>

      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
