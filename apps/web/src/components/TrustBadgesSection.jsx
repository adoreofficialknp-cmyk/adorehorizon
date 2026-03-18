
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, Gem, RefreshCw, Truck, RotateCcw } from 'lucide-react';
import api from '@/lib/api.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const TrustBadgesSection = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBadges = async () => {
    setLoading(true);
    setError(false);
    try {
      const records = { items: [] }; // trust_badges not in new backend
      
      if (records.items.length > 0) {
        setBadges(records.items);
      } else {
        // Fallback default badges if none in DB
        setBadges([
          { id: '1', badge_title: 'Certified Authentic', badge_description: '100% genuine materials and gemstones, certified by experts.', badge_icon: 'ShieldCheck' },
          { id: '2', badge_title: 'Lifetime Warranty', badge_description: 'Quality guaranteed for a lifetime. We stand behind our craftsmanship.', badge_icon: 'Award' },
          { id: '3', badge_title: 'Ethically Sourced', badge_description: 'Conflict-free diamonds and metals sourced with care.', badge_icon: 'Gem' },
          { id: '4', badge_title: 'Secure Shipping', badge_description: 'Fully insured and trackable delivery to your doorstep.', badge_icon: 'Truck' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching trust badges:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
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

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-border/50">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-card border-y border-border text-center">
        <p className="text-muted-foreground mb-4">Failed to load certifications.</p>
        <Button variant="outline" onClick={fetchBadges}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">The ADORE Promise</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            We are committed to providing you with the highest quality jewelry and an exceptional shopping experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className="flex flex-col items-center text-center group p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                {renderIcon(badge.badge_icon)}
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-3 text-foreground">
                {badge.badge_title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm">
                {badge.badge_description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
