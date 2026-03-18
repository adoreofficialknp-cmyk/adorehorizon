
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { CartContext } from '@/contexts/CartContext.jsx';
import api from '@/lib/api.js';
import { toast } from 'sonner';
import OptimizedImage from './OptimizedImage.jsx';
import WishlistButton from './WishlistButton.jsx';
import { trackSelectItem } from '@/utils/analytics.js';

const ProductCard = ({ product, listName = 'Category List' }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  let imageUrl = null;
  if (product?.images && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (product?.product_images_new && product.product_images_new.length > 0) {
    imageUrl = product.product_images_new[0];
  }

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleProductClick = () => {
    trackSelectItem(product, listName);
  };

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
      <Link to={`/product/${product.id}`} onClick={handleProductClick} className="relative aspect-[4/5] overflow-hidden bg-muted block">
        {imageUrl ? (
          <OptimizedImage 
            src={imageUrl} 
            alt={product.name || 'Product Image'} 
            className="w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <img 
              src="https://placehold.co/400x500/f3f4f6/a1a1aa?text=No+Image" 
              alt="Placeholder" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {(product.is_new || product.isNew) && <Badge className="bg-primary text-primary-foreground border-none">New</Badge>}
          {(product.is_sale || product.comparePrice > product.price) && <Badge variant="destructive" className="border-none">Sale</Badge>}
          {product.discount_percentage > 0 && (
            <Badge variant="destructive" className="border-none">-{product.discount_percentage}%</Badge>
          )}
        </div>

        <WishlistButton productId={product.id} className="absolute top-3 right-3" />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex gap-2">
            <Button 
              onClick={handleAddToCart}
              variant="secondary"
              className="flex-1 bg-white text-black hover:bg-gray-100 shadow-lg h-12"
            >
              <ShoppingBag className="w-4 h-4 mr-2" /> Add
            </Button>
            <Button 
              onClick={handleBuyNow}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg h-12"
            >
              <Zap className="w-4 h-4 mr-2" /> Buy Now
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
          <span className="text-xs font-medium">{product.rating || '5.0'}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount || product.review_count || 0})</span>
        </div>
        
        <Link to={`/product/${product.id}`} onClick={handleProductClick} className="font-serif font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
          {product.name}
        </Link>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className="font-semibold text-foreground">₹{product.price?.toLocaleString()}</span>
          {product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through">₹{product.original_price?.toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2 mt-4 md:hidden">
          <Button 
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground touch-target"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="flex-[2] h-12 bg-primary text-primary-foreground hover:bg-primary/90 touch-target font-medium"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
