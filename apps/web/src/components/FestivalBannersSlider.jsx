
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import api from '@/lib/api.js';

const fallbackFestivals = [
  { id: 'f1', name: 'Diwali Special', offer: 'Flat 20% Off on Gold', img: 'https://images.unsplash.com/photo-1605583148006-ce890ef569ec?q=80&w=1200&auto=format&fit=crop', endDays: 5 },
  { id: 'f2', name: 'Wedding Season', offer: 'Up to 30% Off Bridal Sets', img: 'https://images.unsplash.com/photo-1592160957336-aa3b6fac9d6c?q=80&w=1200&auto=format&fit=crop', endDays: 12 },
];

const CountdownTimer = ({ targetDate, days }) => {
  const [timeLeft, setTimeLeft] = useState({ d: days || 0, h: 23, m: 59, s: 59 });

  useEffect(() => {
    let target = targetDate ? new Date(targetDate).getTime() : new Date().getTime() + (days * 24 * 60 * 60 * 1000);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      
      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, days]);

  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 w-fit border border-white/20">
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex gap-2 text-white font-medium text-sm tabular-nums">
        <span>{timeLeft.d}d</span>:
        <span>{timeLeft.h}h</span>:
        <span>{timeLeft.m}m</span>:
        <span>{timeLeft.s}s</span>
      </div>
    </div>
  );
};

const FestivalBannersSlider = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        console.log('Fetching festival banners...');
        const records = []; // festival_banners merged into homepage sections

        if (records.length > 0) {
          setFestivals(records.map(r => ({
            id: r.id,
            name: r.festivalName,
            offer: r.discountOffer,
            img: r.bannerImage ? r.bannerImage : fallbackFestivals[0].img,
            targetDate: r.countdownEndDate,
            ctaText: r.ctaText || 'Shop Now',
            ctaLink: r.ctaLink || '/shop?sale=true'
          })));
        } else {
          setFestivals(fallbackFestivals);
        }
      } catch (error) {
        console.error('Error fetching festival banners:', error);
        setFestivals(fallbackFestivals);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, []);

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
    return (
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-full h-[300px] md:h-[400px] rounded-3xl" />
        </div>
      </section>
    );
  }

  if (!festivals.length) return null;

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {festivals.map((fest) => (
              <div key={fest.id} className="flex-[0_0_100%] md:flex-[0_0_80%] lg:flex-[0_0_60%] min-w-0 px-2 md:px-4">
                <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden group shadow-lg">
                  <img 
                    src={fest.img} 
                    alt={fest.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
                    <span className="text-primary font-bold tracking-wider uppercase text-sm mb-3 block">
                      {fest.name}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 max-w-md leading-tight">
                      {fest.offer}
                    </h3>
                    <div className="mb-8">
                      <CountdownTimer targetDate={fest.targetDate} days={fest.endDays} />
                    </div>
                    <Link to={fest.ctaLink || '/shop?sale=true'}>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 w-fit transition-transform hover:scale-105">
                        {fest.ctaText || 'Shop Now'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-6">
          {festivals.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex ? 'bg-primary w-6' : 'bg-border hover:bg-primary/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FestivalBannersSlider;
