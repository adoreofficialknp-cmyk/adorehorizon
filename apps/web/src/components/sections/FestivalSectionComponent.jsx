
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FestivalSectionComponent = ({ section }) => {
  const items = section?.data?.items || section?.layout_config?.items || [];

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(section.title || section.subtitle) && (
          <div className="text-center mb-12">
            {section.title && <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{section.title}</h2>}
            {section.subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden group shadow-lg">
              <img 
                src={item.image || 'https://placehold.co/800x600/f3f4f6/a1a1aa?text=No+Image'} 
                alt={item.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-3 block">
                  {item.name}
                </span>
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 max-w-md leading-tight">
                  {item.discount || item.description}
                </h3>
                {(item.cta_text && item.cta_link) && (
                  <Link to={item.cta_link}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-12 w-fit transition-transform hover:scale-105">
                      {item.cta_text}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FestivalSectionComponent;
