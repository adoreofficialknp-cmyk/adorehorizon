
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api.js';

const fallbackCategories = [
  { id: 'c1', name: 'Gold', count: '120+ Designs', img: 'https://images.unsplash.com/photo-1679973298979-e35acd347529?q=80&w=800&auto=format&fit=crop' },
  { id: 'c2', name: 'Diamond', count: '85+ Designs', img: 'https://images.unsplash.com/photo-1694868016080-6ad62c44e50e?q=80&w=800&auto=format&fit=crop' },
  { id: 'c3', name: 'Gemstone', count: '60+ Designs', img: 'https://images.unsplash.com/photo-1610806962078-e9c4447557f3?q=80&w=800&auto=format&fit=crop' },
  { id: 'c4', name: 'Silver', count: '200+ Designs', img: 'https://images.unsplash.com/photo-1696583059001-e2646535496e?q=80&w=800&auto=format&fit=crop' },
  { id: 'c5', name: 'Platinum', count: '40+ Designs', img: 'https://images.unsplash.com/photo-1607705992034-4d7de66eb3ec?q=80&w=800&auto=format&fit=crop' },
];

const ShopByBondSlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories for Shop By Bond...');
        const records = await api.get('/categories?limit=500').then(d => Array.isArray(d) ? d : d.items || []);

        if (records.length > 0) {
          setCategories(records.map(r => ({
            id: r.id,
            name: r.name,
            count: 'Explore Collection',
            img: r.image ? r.image : fallbackCategories[0].img
          })));
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-10" />
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_18%] aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Shop by Material</h2>
            <div className="h-1 w-20 bg-primary rounded-full"></div>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={scrollPrev} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={scrollNext} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 touch-pan-y">
            {categories.map((cat) => (
              <div key={cat.id} className="flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_18%] min-w-0">
                <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="group block relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md hover:shadow-xl transition-all duration-300">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-serif font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-sm text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{cat.count}</p>
                    <span className="inline-flex items-center text-sm font-medium text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByBondSlider;
