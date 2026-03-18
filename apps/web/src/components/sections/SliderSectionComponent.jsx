
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api.js';
import { Skeleton } from '@/components/ui/skeleton';

const SliderSectionComponent = ({ sectionId, settings = {} }) => {
  // 1. Unconditional Hooks
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: (settings.autoplay_interval || 5) * 1000, stopOnInteraction: false })
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchSlides = async () => {
      if (!sectionId || sectionId === 'preview-id') {
        setLoading(false);
        return;
      }
      try {
        const records = []; // homepage_slides replaced by homepage sections
        setSlides(records);
      } catch (e) {
        console.error('Failed to fetch slides:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, [sectionId]);

  // 2. Conditional Rendering
  if (loading) {
    return <Skeleton className="w-full h-[60vh] min-h-[400px] rounded-none" />;
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[50vh] min-h-[400px] bg-muted/30 flex flex-col items-center justify-center text-muted-foreground border-y border-border/50">
        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-medium">Slider Section</p>
        <p className="text-sm opacity-70">No slides have been added yet. Edit this section to add slides.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden group bg-muted">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {slide.image ? (
                <img 
                  src={slide.image} 
                  alt={slide.heading || 'Slide image'} 
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-24 h-24 text-slate-400 opacity-20" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl text-left">
                    {slide.heading && (
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {slide.heading}
                      </h2>
                    )}
                    {slide.description && (
                      <p className="text-lg md:text-xl text-white/90 mb-10 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                        {slide.description}
                      </p>
                    )}
                    {slide.button_text && slide.button_url && (
                      <Link to={slide.button_url}>
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 rounded-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 transition-all hover:scale-105">
                          {slide.button_text}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {settings.show_arrows !== false && slides.length > 1 && (
        <>
          <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {settings.show_dots !== false && slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === selectedIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SliderSectionComponent;
