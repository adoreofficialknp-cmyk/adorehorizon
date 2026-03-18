
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import api from '@/lib/api.js';

const WishlistSection = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    toast.success('Moved to cart');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/wishlist');
    toast.success('Wishlist link copied to clipboard!');
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">My Wishlist</h2>
          <p className="text-muted-foreground text-sm mt-1">{wishlistItems.length} items saved</p>
        </div>
        {wishlistItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleShare} className="hidden sm:flex">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Your wishlist is empty</h3>
          <p className="text-muted-foreground mt-1 mb-6">Save items you love to review them later.</p>
          <Link to="/shop">
            <Button className="bg-secondary text-secondary-foreground hover:bg-accent">
              Explore Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = item.expand?.productId;
            if (!product) return null;
            
            const imageUrl = product.images?.[0] ? product.images[0] : null;
            const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

            return (
              <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-square bg-muted">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-foreground truncate hover:text-secondary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <span className="font-semibold text-secondary">₹{product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-foreground text-background hover:bg-secondary hover:text-secondary-foreground transition-colors"
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistSection;
