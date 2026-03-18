
import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ReviewForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    onSubmit({ rating, title, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-serif font-semibold text-foreground mb-1">Write a Review</h3>
        <p className="text-sm text-muted-foreground">Share your experience with this product.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Overall Rating <span className="text-destructive">*</span></Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                setRating(star);
                setError('');
              }}
              aria-label={`Rate ${star} stars`}
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating) 
                    ? 'fill-yellow-500 text-yellow-500' 
                    : 'text-muted-foreground/30'
                }`} 
              />
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title" className="text-foreground">Review Title (Optional)</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment" className="text-foreground">Review Details (Optional)</Label>
        <Textarea
          id="review-comment"
          placeholder="What did you like or dislike? How is the quality?"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          className="min-h-[120px] bg-background resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting</> : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
