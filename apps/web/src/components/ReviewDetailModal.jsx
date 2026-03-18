
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

const ReviewDetailModal = ({ review, isOpen, onClose, onAction }) => {
  const [response, setResponse] = useState('');

  if (!review) return null;

  const handleAction = (actionType) => {
    onAction(review.id, actionType, response);
    setResponse('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{review.expand?.user_id?.name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{review.expand?.user_id?.email}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-1">Product ID: {review.product_id}</p>
            <p className="text-sm leading-relaxed">{review.comment || 'No comment provided.'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Response (Internal Note)</label>
            <Textarea 
              placeholder="Add a note or response..." 
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="destructive" onClick={() => handleAction('delete')}>
            Delete Review
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => handleAction('approve')}>Approve & Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailModal;
