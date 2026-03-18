
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ColorGridSectionComponent = ({ section }) => {
  const items = section?.data?.items || section?.layout_config?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              {section.title || 'Shop by Material'}
            </h2>
            {section.subtitle && (
              <p className="text-muted-foreground max-w-2xl text-sm md:text-base">{section.subtitle}</p>
            )}
          </div>
          {section.cta_text && section.cta_link && (
            <Link to={section.cta_link} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {section.cta_text} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, idx) => (
            <Link key={idx} to={`/shop?color=${encodeURIComponent(item.name)}`} className="group block relative overflow-hidden rounded-2xl aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300">
              <img 
                src={item.image || 'https://placehold.co/400x500/f3f4f6/a1a1aa?text=No+Image'} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-serif font-bold text-white mb-1">{item.name}</h3>
                {item.count && <p className="text-sm text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{item.count}</p>}
                <span className="inline-flex items-center text-sm font-medium text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ColorGridSectionComponent;
