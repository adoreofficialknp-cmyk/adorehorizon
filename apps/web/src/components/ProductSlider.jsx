
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api.js';

const ProductSlider = ({ title = "Featured Products", fetchFilter = "is_best_seller = true", linkTo = "/shop", linkText = "View All" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log(`Fetching products for slider with filter: ${fetchFilter}`);
        const records = await api.get('/products?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.items || [], totalPages: d.totalPages || 1 }));
        setProducts(records.items);
      } catch (error) {
        console.error('Error fetching products for slider:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [fetchFilter]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-10" />
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_23%] min-w-0">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{title}</h2>
            <div className="h-1 w-20 bg-primary rounded-full"></div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link to={linkTo} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center">
              {linkText} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
            <div className="flex gap-2 ml-4 border-l border-border pl-4">
              <button onClick={scrollPrev} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={scrollNext} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 touch-pan-y pb-4">
            {products.map((product) => (
              <div key={product.id} className="flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_23%] min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to={linkTo}>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl h-12">
              {linkText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
