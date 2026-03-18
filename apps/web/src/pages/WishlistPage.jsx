import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Heart, ShoppingBag, Trash2, Share2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { CartContext } from '@/contexts/CartContext';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import ShareWishlistModal from '@/components/ShareWishlistModal';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading: contextLoading } = useWishlist();
  const { addToCart } = useContext(CartContext);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch products for all wishlist items
        const productIds = wishlistItems.map(item => item.productId || item.id).filter(Boolean);
        const productPromises = productIds.map(id => api.get(`/products/${id}`).catch(() => null));
        const records = (await Promise.all(productPromises)).filter(Boolean);
        
        // Map addedDate from wishlistItems to products for sorting
        const productsWithDates = records.map(prod => {
          const wishlistItem = wishlistItems.find(w => w.productId === prod.id);
          return {
            ...prod,
            addedDate: wishlistItem?.created || new Date().toISOString()
          };
        });
        
        setProducts(productsWithDates);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        toast.error('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };
    
    if (!contextLoading) {
      fetchProducts();
    }
  }, [wishlistItems, contextLoading]);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    toast.success('Moved to cart');
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // newest default
      return new Date(b.addedDate) - new Date(a.addedDate);
    });
  }, [products, sortBy]);

  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

  if (contextLoading || (loading && wishlistItems.length > 0)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <Heart className="w-12 h-12 text-primary/50 mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>My Wishlist - ADORE Jewellery</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-primary fill-primary/10" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">My Wishlist</h1>
            </div>
            {products.length > 0 && (
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? 'item' : 'items'} • Total Value: <span className="font-medium text-foreground">₹{totalValue.toLocaleString()}</span>
              </p>
            )}
          </div>

          {products.length > 0 && (
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Recently Added</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setIsShareModalOpen(true)} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-muted/30 rounded-3xl border border-border max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
              <Heart className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-serif font-medium mb-3 text-foreground">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Save your favorite pieces to view them later or share them with friends and family.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
              <Link to="/shop">
                Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map(product => {
              let imageUrl = null;
              if (product?.images && product.images.length > 0) {
                imageUrl = product.images[0];
              } else if (product?.product_images_new && product.product_images_new.length > 0) {
                imageUrl = product.product_images_new?.[0] || "";
              }

              return (
                <div key={product.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-muted block">
                    {imageUrl ? (
                      <OptimizedImage 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white transition-colors shadow-sm z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <Link to={`/product/${product.id}`} className="font-serif font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-6 mt-auto">
                      <span className="font-semibold text-foreground">₹{product.price?.toLocaleString()}</span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.original_price?.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleMoveToCart(product)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" /> Move to Cart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />

      <ShareWishlistModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        itemCount={products.length}
        totalValue={totalValue}
      />
    </div>
  );
};

export default WishlistPage;