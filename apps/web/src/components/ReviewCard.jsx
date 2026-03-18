
import React, { useState } from 'react';
import { Star, BadgeCheck, ThumbsUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const ReviewCard = ({ review, onHelpfulClick }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleHelpful = async () => {
    if (hasVoted || !onHelpfulClick) return;
    setHasVoted(true);
    const newCount = await onHelpfulClick(review.id, helpfulCount);
    if (typeof newCount === 'number') setHelpfulCount(newCount);
    else setHelpfulCount(prev => prev + 1); // optimistic increment
  };

  const userName = review.expand?.user_id?.name || 'Anonymous Customer';
  const dateStr = (review.createdAt || review.created) ? formatDistanceToNow(new Date(review.createdAt || review.created), { addSuffix: true }) : 'Recently';

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        
        <div className="flex items-center gap-3 sm:w-48 shrink-0">
          <Avatar className="h-10 w-10 rounded-xl border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium rounded-xl">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground line-clamp-1">{userName}</span>
            {review.verified_purchase && (
              <span className="text-[10px] font-medium text-green-600 flex items-center mt-0.5">
                <BadgeCheck className="w-3 h-3 mr-1" /> Verified Buyer
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
              {dateStr}
            </span>
          </div>
          
          {review.title && (
            <h4 className="font-semibold text-foreground mb-2 text-base">{review.title}</h4>
          )}
          
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {review.comment}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <button 
              onClick={handleHelpful}
              disabled={hasVoted}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                hasVoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-primary' : ''}`} />
              Helpful ({helpfulCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
