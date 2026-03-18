import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api.js';
import { CartContext } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

/**
 * SharedWishlistPage
 *
 * The "share wishlist" feature was PocketBase-specific (wishlist_shares collection).
 * The new backend stores wishlists in localStorage only — no server-side sharing.
 *
 * This page gracefully handles the case by showing a "link not supported" message
 * with a call-to-action to browse the shop. The UI structure is kept intact so
 * the feature can be wired up later if a server-side wishlist is added.
 */
const SharedWishlistPage = () => {
  const { token } = useParams();
  const { addToCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  // Shared wishlist sharing via server is not implemented in the current backend.
  // Wishlists are stored in localStorage and not shareable via link yet.
  const error = 'Wishlist sharing via link is coming soon. Browse our collection in the meantime!';

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Shared Wishlist - ADORE Jewellery" />
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-3">Wishlist Sharing Coming Soon</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/shop">Browse Our Collection <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SharedWishlistPage;
