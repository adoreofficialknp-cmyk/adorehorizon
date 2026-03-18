
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api.js';

const PromoBannerDisplay = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        console.log('Fetching promo banners...');
        const now = new Date().toISOString();
        const records = []; // promo_banners merged into homepage sections
        setPromos(records);
      } catch (error) {
        console.error('Failed to fetch promo banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleTrackClick = async (id) => {
    try {
      const promo = promos.find(p => p.id === id);
      if (promo) {
        // promo click tracking not in new backend
      }
    } catch (e) {
      // Silent fail for tracking
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-full h-32 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (promos.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {promos.map(promo => (
          <div 
            key={promo.id} 
            className="relative w-full py-8 px-6 md:px-10 rounded-2xl flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-lg overflow-hidden group"
            style={{ 
              backgroundColor: promo.background_color || 'hsl(var(--primary))',
              color: promo.text_color || 'hsl(var(--primary-foreground))'
            }}
          >
            {/* Optional Background Image Overlay */}
            {promo.background_image && (
              <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
                <img 
                  src={promo.background_image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="relative z-10 flex items-center gap-4 mb-6 md:mb-0">
              <div className="hidden md:flex h-12 w-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-1">{promo.title}</h3>
                {promo.message && <p className="text-sm md:text-base opacity-90">{promo.message}</p>}
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              {promo.discount_text && (
                <div className="text-xl font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  {promo.discount_text}
                </div>
              )}
              
              {promo.cta_text && promo.cta_link && (
                <Link to={promo.cta_link} onClick={() => handleTrackClick(promo.id)}>
                  <Button 
                    variant="secondary" 
                    className="rounded-full px-8 h-12 font-medium shadow-md hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: promo.text_color || 'hsl(var(--primary-foreground))',
                      color: promo.background_color || 'hsl(var(--primary))'
                    }}
                  >
                    {promo.cta_text} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoBannerDisplay;
