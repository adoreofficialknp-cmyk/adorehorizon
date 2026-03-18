import React from 'react';
import SliderSectionComponent from './SliderSectionComponent.jsx';
import FestivalSectionComponent from './FestivalSectionComponent.jsx';
import ColorGridSectionComponent from './ColorGridSectionComponent.jsx';
import TrustBadgesSectionComponent from './TrustBadgesSectionComponent.jsx';
import HeroSectionComponent from './HeroSectionComponent.jsx';

/**
 * Renders a homepage section based on its type.
 * Supports both new API types and legacy section_type values.
 */
const DynamicSectionRenderer = ({ section }) => {
  if (!section) return null;
  if (section.active === false) return null;

  // Support both new (section.type) and legacy (section.section_type)
  const type = section.type || section.section_type || '';

  switch (type) {
    // ── New API types ──────────────────────────────────────
    case 'banner_slider':
      return <BannerSliderSection section={section} />;

    case 'featured_products':
      return <FeaturedProductsSection section={section} />;

    case 'festivals':
      return <FestivalSectionComponent section={section} />;

    case 'shop_by_color':
      return <ColorGridSectionComponent section={section} />;

    case 'custom_banner':
      return <CustomBannerSection section={section} />;

    // ── Legacy types (backward compat) ────────────────────
    case 'banner':
    case 'hero':
      return <HeroSectionComponent section={section} />;

    case 'color_grid':
      return <ColorGridSectionComponent section={section} />;

    case 'festival':
    case 'promo':
      return <FestivalSectionComponent section={section} />;

    case 'trust_badges':
    case 'testimonials':
      return <TrustBadgesSectionComponent section={section} />;

    case 'carousel':
    case 'slider':
      return <SliderSectionComponent sectionId={section.id} settings={section.layout_config} />;

    default:
      return null; // Silently skip unknown types in production
  }
};

// ── Inline section renderers for new types ─────────────────────────

const BannerSliderSection = ({ section }) => {
  const banners = section.data?.banners || [];
  const [idx, setIdx] = React.useState(0);

  if (!banners.length) return null;

  const banner = banners[idx];
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '300px', background: '#1a1a1a' }}>
      {banner?.imageUrl && (
        <img
          src={banner.imageUrl}
          alt={banner.title || ''}
          className="w-full h-full object-cover absolute inset-0"
          style={{ opacity: 0.85 }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px] text-center px-4 py-16">
        {section.title && (
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{section.title}</h2>
        )}
        {banner?.title && (
          <h3 className="text-xl md:text-3xl font-serif text-amber-300 mb-6">{banner.title}</h3>
        )}
        {banner?.link && (
          <a href={banner.link} className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors">
            Shop Now
          </a>
        )}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeaturedProductsSection = ({ section }) => {
  const products = section.products || [];
  const subtitle = section.data?.subtitle || 'Handpicked for you';

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold">{section.title || 'Featured Collection'}</h2>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <a key={product.id} href={`/product/${product.id}`} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">💎</div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-amber-600 font-semibold mt-1">₹{product.price?.toLocaleString()}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No featured products yet. Mark products as featured in Admin → Products.</p>
      )}
    </div>
  );
};

const CustomBannerSection = ({ section }) => {
  const { imageUrl, link, title } = section.data || {};
  return (
    <div className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {imageUrl ? (
          <a href={link || '#'} className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
            <img src={imageUrl} alt={title || section.title || 'Banner'} className="w-full object-cover" />
          </a>
        ) : section.title ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-amber-800">{section.title}</h2>
            {link && <a href={link} className="mt-4 inline-block text-amber-600 underline">Learn more</a>}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DynamicSectionRenderer;
