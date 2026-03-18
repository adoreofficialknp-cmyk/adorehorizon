
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Image as ImageIcon, Grid, Star, Gift, Mail } from 'lucide-react';

export const SECTION_TEMPLATES = [
  {
    id: 'hero_banner',
    name: 'Hero Banner',
    icon: ImageIcon,
    description: 'Full-width banner with heading and CTA',
    data: {
      section_name: 'Main Hero Banner',
      section_type: 'banner',
      title: 'Discover Timeless Elegance',
      subtitle: 'Handcrafted jewelry for your special moments.',
      cta_text: 'Shop Collection',
      cta_link: '/shop',
      active: true,
      layout_config: { enable_slider: false }
    }
  },
  {
    id: 'color_grid',
    name: 'Color Showcase',
    icon: Grid,
    description: 'Grid of colors or materials',
    data: {
      section_name: 'Shop by Material',
      section_type: 'color_grid',
      title: 'Shop by Material',
      subtitle: 'Find the perfect hue to match your style.',
      active: true,
      layout_config: {
        items: [
          { name: 'Gold', count: '120+ Designs', image: 'https://images.unsplash.com/photo-1679973298979-e35acd347529?q=80&w=800&auto=format&fit=crop' },
          { name: 'Diamond', count: '85+ Designs', image: 'https://images.unsplash.com/photo-1694868016080-6ad62c44e50e?q=80&w=800&auto=format&fit=crop' },
          { name: 'Silver', count: '200+ Designs', image: 'https://images.unsplash.com/photo-1696583059001-e2646535496e?q=80&w=800&auto=format&fit=crop' }
        ]
      }
    }
  },
  {
    id: 'festival_promo',
    name: 'Festival / Promo',
    icon: Gift,
    description: 'Highlight special occasions and offers',
    data: {
      section_name: 'Festive Offers',
      section_type: 'festival',
      title: 'Festive Specials',
      active: true,
      layout_config: {
        layout_type: 'slider',
        items: [
          { name: 'Diwali Special', discount: 'Flat 20% Off', image: 'https://images.unsplash.com/photo-1605583148006-ce890ef569ec?q=80&w=1200&auto=format&fit=crop', cta_text: 'Shop Now', cta_link: '/shop' }
        ]
      }
    }
  },
  {
    id: 'trust_badges',
    name: 'Trust & Testimonials',
    icon: Star,
    description: 'Build trust with badges and reviews',
    data: {
      section_name: 'Why Choose Us',
      section_type: 'trust_badges',
      title: 'The ADORE Promise',
      subtitle: 'Committed to quality and excellence.',
      active: true,
      layout_config: {}
    }
  }
];

const SectionTypeTemplates = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {SECTION_TEMPLATES.map((template) => {
        const Icon = template.icon;
        return (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
            onClick={() => onSelect(template.data)}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SectionTypeTemplates;
