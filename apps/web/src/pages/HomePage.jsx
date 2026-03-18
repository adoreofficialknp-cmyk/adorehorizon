
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer.jsx';
import SectionErrorBoundary from '@/components/SectionErrorBoundary.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import api from '@/lib/api.js';
import SEO from '@/components/SEO.jsx';
import { generateOrganizationSchema, generateBreadcrumbSchema } from '@/utils/seoHelpers.js';

const HomePage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await api.get('/homepage');
        setSections(Array.isArray(data) ? data : data.items || []);
      } catch (error) {
        console.error('Error fetching homepage sections:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  const schemas = [
    generateOrganizationSchema(),
    generateBreadcrumbSchema([{ name: 'Home', url: '/' }])
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="ADORE Jewellery - Premium Luxury Jewelry & Accessories"
        description="Discover exquisite luxury jewelry at ADORE. Premium rings, necklaces, bracelets & more. Shop authentic designer jewelry with free shipping."
        keywords="luxury jewelry, premium rings, designer necklaces, jewelry store, luxury accessories"
        url="/"
        schema={schemas}
      />

      <Header />
      
      <main className="flex-1 w-full overflow-hidden">
        {/* Visually hidden H1 for SEO purposes, ensuring there is exactly one H1 on the page */}
        <h1 className="sr-only">Premium Luxury Jewelry Collection</h1>

        {loading ? (
          <div className="w-full space-y-8">
            <Skeleton className="w-full h-[80vh] rounded-none" />
            <div className="max-w-7xl mx-auto px-4 space-y-8">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
              </div>
            </div>
          </div>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <SectionErrorBoundary key={section.id}><DynamicSectionRenderer section={section} /></SectionErrorBoundary>
          ))
        ) : (
          <div className="py-32 text-center">
            <h2 className="text-2xl font-serif text-muted-foreground">Welcome to ADORE</h2>
            <p className="mt-2 text-muted-foreground">Our storefront is currently being updated. Please check back soon.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
