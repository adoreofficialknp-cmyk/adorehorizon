
import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/hooks/useWishlist';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WishlistButton = ({ productId, className, variant = 'icon', showLabel = false }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const tooltipText = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';

  if (variant === 'button') {
    return (
      <Button 
        variant="outline" 
        className={cn("gap-2 transition-all duration-300", className)}
        onClick={handleToggle}
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart className={cn("w-5 h-5", isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground")} />
        </motion.div>
        {showLabel && <span>{tooltipText}</span>}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors touch-target z-10",
              className
            )}
            aria-label={tooltipText}
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4, type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-colors duration-300", 
                  isWishlisted ? "fill-destructive text-destructive" : "text-foreground hover:text-destructive"
                )} 
              />
            </motion.div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-xs font-medium">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WishlistButton;
