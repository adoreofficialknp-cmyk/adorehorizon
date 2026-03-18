
import React from 'react';
import { format } from 'date-fns';
import { Star, BadgeCheck, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api.js';

const ReviewDetailsModal = ({ review, isOpen, onClose, onApprove, onReject, onDelete }) => {
  if (!review) return null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  const product = review.expand?.product_id;
  const user = review.expand?.user_id;
  
  let imageUrl = null;
  if (product?.images && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (product?.product_images_new && product.product_images_new.length > 0) {
    imageUrl = product.product_images_new[0];
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center justify-between">
            Review Details
            <Badge variant={
              review.status === 'approved' ? 'default' : 
              review.status === 'rejected' ? 'destructive' : 'secondary'
            } className="ml-4 capitalize">
              {review.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
              {imageUrl ? (
                <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Product</p>
              <p className="font-medium text-foreground">{product?.name || 'Unknown Product'}</p>
              <p className="text-xs text-muted-foreground mt-1">ID: {product?.id}</p>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
              </span>
            </div>

            {review.title && (
              <h3 className="text-lg font-semibold text-foreground">{review.title}</h3>
            )}

            <div className="p-4 bg-muted/20 rounded-xl border border-border text-sm leading-relaxed text-foreground">
              {review.comment || <span className="text-muted-foreground italic">No comment provided.</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{user?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Purchase Status</p>
                {review.verified_purchase ? (
                  <span className="inline-flex items-center text-green-600 font-medium">
                    <BadgeCheck className="w-4 h-4 mr-1" /> Verified Purchase
                  </span>
                ) : (
                  <span className="text-muted-foreground">Unverified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center sm:justify-between border-t pt-4">
          <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => onDelete(review.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          
          <div className="flex gap-2">
            {review.status !== 'rejected' && (
              <Button variant="outline" onClick={() => onReject(review.id)}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            )}
            {review.status !== 'approved' && (
              <Button onClick={() => onApprove(review.id)} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailsModal;
