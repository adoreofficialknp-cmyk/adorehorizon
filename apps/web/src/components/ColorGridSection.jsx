
import React from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, StaggerContainer, StaggerItem } from './ScrollAnimations';
import OptimizedImage from './OptimizedImage';

const colors = [
  { id: 'gold', name: 'Yellow Gold', hex: '#D4AF37', count: 124, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' },
  { id: 'silver', name: 'Sterling Silver', hex: '#C0C0C0', count: 86, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
  { id: 'rose', name: 'Rose Gold', hex: '#B76E79', count: 92, image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop' },
  { id: 'diamond', name: 'Diamonds', hex: '#F3F3F3', count: 215, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' },
  { id: 'emerald', name: 'Emeralds', hex: '#50C878', count: 45, image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop' },
  { id: 'sapphire', name: 'Sapphires', hex: '#0F52BA', count: 63, image: 'https://images.unsplash.com/photo-1573408301145-b98c4af06b8f?q=80&w=800&auto=format&fit=crop' }
];

const ColorGridSection = ({ section }) => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {section?.title || 'Shop by Material'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {section?.description || 'Discover our exquisite collections categorized by precious metals and gemstones.'}
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {colors.map((color) => (
            <StaggerItem key={color.id}>
              <Link to={`/shop?material=${color.id}`} className="group block">
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 luxury-shadow luxury-transition group-hover:-translate-y-2">
                  <OptimizedImage 
                    src={color.image} 
                    alt={color.name} 
                    className="w-full h-full group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div 
                    className="absolute bottom-4 right-4 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{color.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{color.count} Products</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default ColorGridSection;
