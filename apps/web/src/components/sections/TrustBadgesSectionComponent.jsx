
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, Gem, Truck, RotateCcw, Star } from 'lucide-react';
import api from '@/lib/api.js';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const TrustBadgesSectionComponent = ({ section }) => {
  const [badges, setBadges] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'center' }, [Autoplay({ delay: 5000 })]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [badgesRes, testRes] = await Promise.all([
          Promise.resolve({ items: [] }), // trust_badges not in new backend
          Promise.resolve({ items: [] }) // testimonials not in new backend
        ]);
        setBadges(badgesRes.items);
        setTestimonials(testRes.items);
      } catch (err) {
        console.error('Error fetching trust section data:', err);
      }
    };
    fetchData();
  }, []);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-10 h-10 text-primary" />;
      case 'Award': return <Award className="w-10 h-10 text-primary" />;
      case 'Gem': return <Gem className="w-10 h-10 text-primary" />;
      case 'Truck': return <Truck className="w-10 h-10 text-primary" />;
      case 'RotateCcw': return <RotateCcw className="w-10 h-10 text-primary" />;
      default: return <ShieldCheck className="w-10 h-10 text-primary" />;
    }
  };

  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Badges */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{section.title || 'The ADORE Promise'}</h2>
          {section.subtitle && <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">{section.subtitle}</p>}
        </div>

        {badges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center text-center group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  {renderIcon(badge.badge_icon)}
                </div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-foreground">{badge.badge_title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{badge.badge_description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-serif font-bold text-center mb-10">What Our Customers Say</h3>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y -ml-4">
                {testimonials.map((test) => (
                  <div key={test.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 min-w-0">
                    <div className="bg-background p-8 rounded-2xl border border-border/50 h-full flex flex-col">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                      <p className="text-foreground italic mb-6 flex-1">"{test.review_text}"</p>
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                          {test.customer_image ? (
                            <img src={test.customer_image} alt={test.customer_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                              {test.customer_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{test.customer_name}</p>
                          {test.product_name && <p className="text-xs text-muted-foreground">{test.product_name}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustBadgesSectionComponent;
