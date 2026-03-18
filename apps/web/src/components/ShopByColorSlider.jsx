
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import api from '@/lib/api.js';

const ShopByColorSlider = () => {
  const [loading, setLoading] = useState(true);
  const [colorData, setColorData] = useState([]);

  useEffect(() => {
    const fetchColorProducts = async () => {
      try {
        // Fetch color categories from shop_by_bond collection
        const bonds = []; // shop_by_bond not in new backend

        console.log('Color categories:', bonds);

        if (bonds.length === 0) {
          setColorData([]);
          setLoading(false);
          return;
        }

        // Fetch products for each color category
        const finalData = await Promise.all(bonds.map(async (bond) => {
          let products = [];
          try {
            // Fetch products where color matches the category name
            const result = await api.get('/products?limit=100').then(d => ({ items: Array.isArray(d) ? d : d.items || [], totalPages: d.totalPages || 1 }));
            products = result.items;
            console.log(`Products for color ${bond.category_name}:`, products);
          } catch (err) {
            console.error(`Error fetching products for color ${bond.category_name}:`, err);
          }
          
          return {
            id: bond.id,
            name: bond.category_name,
            image: bond.image ? bond.image : null,
            productCount: bond.product_count || products.length,
            link: bond.cta_link || `/shop?color=${encodeURIComponent(bond.category_name)}`,
            products: products
          };
        }));

        setColorData(finalData);
      } catch (error) {
        console.error('Error fetching shop by color data:', error);
        setColorData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColorProducts();
  }, []);

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = 'https://placehold.co/400x500/f3f4f6/a1a1aa?text=No+Image';
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (colorData.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 md:mb-3">
              Shop by Color
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">Find the perfect hue to match your style.</p>
          </div>
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors touch-target"
          >
            View All Colors <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {colorData.map((color) => (
            <div key={color.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Category Header with Image */}
              <Link to={color.link} className="relative h-48 md:h-56 overflow-hidden bg-muted block group">
                {color.image ? (
                  <img 
                    src={color.image} 
                    alt={color.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary/40 font-serif text-4xl font-bold">{color.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">{color.name}</h3>
                      <p className="text-white/80 text-sm">{color.productCount} Products</p>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                      Shop Collection
                    </Button>
                  </div>
                </div>
              </Link>
              
              {/* Product Grid */}
              <div className="p-4 md:p-6">
                {color.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {color.products.map(product => {
                      const productImg = product.images?.[0] 
                        ? product.images[0] 
                        : product.product_images_new?.[0]
                          ? product.product_images_new[0]
                          : null;

                      return (
                        <Link key={product.id} to={`/product/${product.id}`} className="group block">
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3 relative border border-border/50">
                            {productImg ? (
                              <img 
                                src={productImg} 
                                alt={product.name}
                                onError={handleImageError}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                <img src="https://placehold.co/300x300/f3f4f6/a1a1aa?text=No+Image" alt="Placeholder" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="sm" className="rounded-full hidden md:flex shadow-lg">
                                <ShoppingBag className="w-4 h-4 mr-2" /> View
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm font-semibold text-foreground">₹{product.price?.toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">{product.rating || '5.0'}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 md:py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                    <p className="text-sm">No products available in this color yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByColorSlider;
