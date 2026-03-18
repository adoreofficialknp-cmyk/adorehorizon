
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api.js';
import OptimizedImage from './OptimizedImage';

const fallbackBanners = [
  {
    id: 'fallback-1',
    image: 'https://images.unsplash.com/photo-1674526283171-541615a5dd13?q=80&w=2000&auto=format&fit=crop',
    headline: 'Luxury Jewelry for Every Moment',
    subheadline: 'Discover our handcrafted pieces designed to celebrate your unique story.',
    ctaText: 'Shop Collection',
    ctaLink: '/shop'
  }
];

const HeroBannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const records = await api.get('/banners?type=slider&active=true')
          .then(d => Array.isArray(d) ? d : d.items || [])
          .catch(() => []);

        if (records.length > 0) {
          setBanners(records.map(r => ({
            id: r.id,
            image: r.desktop_image ? r.desktop_image : fallbackBanners[0].image,
            headline: r.title || 'Discover Elegance',
            subheadline: r.description || '',
            ctaText: r.cta_text || 'Shop Now',
            ctaLink: r.cta_link || '/shop'
          })));
        } else {
          setBanners(fallbackBanners);
        }
      } catch (error) {
        setBanners(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (loading) {
    return <Skeleton className="w-full h-[80vh] min-h-[500px] max-h-[800px] rounded-none" />;
  }

  if (!banners.length) return null;

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden group bg-muted">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {banners.map((banner) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              <OptimizedImage 
                src={banner.image} 
                alt={banner.headline} 
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl text-left">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      {banner.headline}
                    </h2>
                    {banner.subheadline && (
                      <p className="text-lg md:text-xl text-white/90 mb-10 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                        {banner.subheadline}
                      </p>
                    )}
                    <Link to={banner.ctaLink}>
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 rounded-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 transition-all hover:scale-105">
                        {banner.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSlider;
