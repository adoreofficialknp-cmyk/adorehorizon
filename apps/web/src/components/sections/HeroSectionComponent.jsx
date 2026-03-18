
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';

const HeroSectionComponent = ({ section }) => {
  const isSlider = section.layout_config?.enable_slider && section.layout_config?.slides?.length > 0;
  const slides = section.layout_config?.slides || [];
  const settings = section.layout_config || {};

  // 1. Unconditional Hook: useEmblaCarousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: (settings.autoplay_interval || 5) * 1000, stopOnInteraction: false })
  ]);

  // 2. Unconditional Hook: useState
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 3. Unconditional Hooks: useCallback
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  // 4. Unconditional Hook: useEffect
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Conditional Rendering Logic (After all hooks)
  if (isSlider) {
    return (
      <div className="relative w-full h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden group bg-muted">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {slides.map((slide, idx) => (
              <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full">
                <img 
                  src={slide.image} 
                  alt={slide.heading} 
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-left">
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {slide.heading}
                      </h2>
                      {slide.description && (
                        <p className="text-lg md:text-xl text-white/90 mb-10 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                          {slide.description}
                        </p>
                      )}
                      {slide.button_text && slide.button_link && (
                        <Link to={slide.button_link}>
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

        {settings.show_arrows !== false && (
          <>
            <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {settings.show_dots !== false && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === selectedIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Static Hero
  const bgImage = section.desktop_image ? section.desktop_image : 'https://images.unsplash.com/photo-1674526283171-541615a5dd13?q=80&w=2000&auto=format&fit=crop';

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden bg-muted">
      <img 
        src={bgImage} 
        alt={section.title} 
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              {section.title || 'Discover Elegance'}
            </h2>
            {section.subtitle && (
              <p className="text-lg md:text-xl text-white/90 mb-10 font-light">
                {section.subtitle}
              </p>
            )}
            {section.cta_text && section.cta_link && (
              <Link to={section.cta_link}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 rounded-full transition-all hover:scale-105">
                  {section.cta_text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionComponent;
