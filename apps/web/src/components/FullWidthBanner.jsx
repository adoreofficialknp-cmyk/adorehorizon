
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FadeIn } from './ScrollAnimations';
import api from '@/lib/api.js';

const FullWidthBanner = ({ section }) => {
  const desktopImg = section.desktop_image ? section.desktop_image : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop';
  const mobileImg = section.mobile_image ? section.mobile_image : desktopImg;
  
  const config = section.layout_config || {};
  const align = config.text_alignment || 'center';
  const opacity = config.overlay_opacity !== undefined ? config.overlay_opacity : 0.3;

  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  };

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] flex items-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full">
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileImg} />
          <img src={desktopImg} alt={section.title || 'Banner'} className="w-full h-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-black" style={{ opacity }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <FadeIn className={`flex flex-col ${alignClasses[align]} max-w-2xl ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`}>
          {section.subtitle && (
            <span className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
              {section.subtitle}
            </span>
          )}
          {section.title && (
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight text-balance">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="text-lg text-white/90 mb-8 text-balance">
              {section.description}
            </p>
          )}
          {section.cta_text && section.cta_link && (
            <Link to={section.cta_link}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 py-6 text-base tracking-wide uppercase">
                {section.cta_text}
              </Button>
            </Link>
          )}
        </FadeIn>
      </div>
    </section>
  );
};

export default FullWidthBanner;
