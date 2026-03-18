import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, Shield, Truck, RotateCcw, ChevronRight, MessageSquare } from 'lucide-react';
import api from '@/lib/api.js';
import { CartContext } from '@/contexts/CartContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import ReviewForm from '@/components/ReviewForm';
import ReviewCard from '@/components/ReviewCard';
import WishlistButton from '@/components/WishlistButton';
import { trackPageLoad } from '@/utils/performanceMonitor';
import { trackProductView } from '@/utils/analytics';
import { useBehaviorTracking } from '@/utils/behaviorTracking';
import SEO from '@/components/SEO.jsx';
import { generateProductSchema, generateBreadcrumbSchema, generateReviewSchema } from '@/utils/seoHelpers';

const ProductDetailPage = () => {
  useBehaviorTracking('ProductDetailPage');
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const { fetchProductReviews, checkVerifiedPurchase, submitReview, toggleHelpful, getReviewStats } = useReviews();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0, rating_distribution: {1:0, 2:0, 3:0, 4:0, 5:0} });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsSort, setReviewsSort] = useState('newest');
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const endTracking = trackPageLoad('ProductDetailPage');
    
    const fetchProductData = async () => {
      try {
        const prod = await api.get(`/products/${id}`);
        setProduct(prod);
        trackProductView(prod);
        
        // Fetch review stats
        const stats = await getReviewStats(id);
        setReviewStats(stats);

        // Check if user can review
        if (isAuthenticated() && currentUser) {
          const verified = await checkVerifiedPurchase(id, currentUser.id);
          setIsVerifiedBuyer(verified);
        }
      } catch (error) {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
        endTracking();
      }
    };
    fetchProductData();
  }, [id, navigate, isAuthenticated, currentUser, checkVerifiedPurchase, getReviewStats]);

  useEffect(() => {
    const loadReviews = async () => {
      const data = await fetchProductReviews(id, reviewsPage, reviewsSort);
      setReviews(data.items);
      setReviewsTotalPages(data.totalPages);
    };
    loadReviews();
  }, [id, reviewsPage, reviewsSort, fetchProductReviews]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart');
  };

  const handleReviewSubmit = async (reviewData) => {
    setIsSubmittingReview(true);
    try {
      await submitReview(id, currentUser.id, reviewData.rating, reviewData.title, reviewData.comment, isVerifiedBuyer);
      setShowReviewForm(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return null;

  const images = product.images || [];

  const schemas = [
    generateProductSchema(product),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Shop', url: '/shop' },
      { name: product.name, url: `/product/${product.id}` }
    ])
  ];
  
  if (reviews.length > 0) {
    const reviewSchema = generateReviewSchema(reviews, product);
    if (reviewSchema) schemas.push(reviewSchema);
  }

  const calculatePercentage = (count) => {
    if (reviewStats.total_reviews === 0) return 0;
    return Math.round((count / reviewStats.total_reviews) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title={`${product.name} - ADORE Jewellery`}
        description={product.description ? `${product.description.substring(0, 155)}...` : `Buy ${product.name} at ADORE Jewellery.`}
        keywords={`${product.name}, ${(product.category?.name || product.category) || ''}, ${product.material || ''}, ${product.color || ''}, luxury jewelry`}
        image={images.length > 0 ? images[0] : null}
        url={`/product/${product.id}`}
        type="product"
        schema={schemas}
      />
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border relative">
              {images.length > 0 ? (
                <OptimizedImage 
                  src={images[selectedImage]} 
                  alt={`${product.name} - View ${selectedImage + 1}`} 
                  className="w-full h-full" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
              <WishlistButton productId={product.id} className="absolute top-4 right-4 w-12 h-12" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <OptimizedImage src={img} alt="" className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(reviewStats.average_rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{reviewStats.average_rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground underline cursor-pointer" onClick={() => document.getElementById('reviews-tab').click()}>
                ({reviewStats.total_reviews} reviews)
              </span>
            </div>

            <div className="text-3xl font-medium text-foreground mb-6">
              ₹{product.price?.toLocaleString()}
              {product.original_price > product.price && (
                <span className="text-lg text-muted-foreground line-through ml-3">₹{product.original_price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <div className="flex items-center border border-border rounded-lg h-12 w-full sm:w-auto shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-lg hover:bg-muted/50 h-full rounded-l-lg" aria-label="Decrease quantity">-</button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-lg hover:bg-muted/50 h-full rounded-r-lg" aria-label="Increase quantity">+</button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 h-12 text-lg bg-primary hover:bg-primary/90 w-full">
                <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
              <WishlistButton productId={product.id} variant="button" showLabel={false} className="h-12 w-12 shrink-0 hidden sm:flex" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-border mt-auto">
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Lifetime Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8">
            <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 text-base">Details</TabsTrigger>
            <TabsTrigger id="reviews-tab" value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-3 text-base">Reviews ({reviewStats.total_reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="prose max-w-none text-muted-foreground">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Product Information</h2>
            <p>{product.description}</p>
            <ul className="mt-4 space-y-2">
              {product.material && <li><strong>Material:</strong> {product.material}</li>}
              {product.color && <li><strong>Color:</strong> {product.color}</li>}
              {(product.category?.name || product.category) && <li><strong>Category:</strong> <Link to={`/shop?category=${(product.category?.name || product.category)}`} className="text-primary hover:underline">{(product.category?.name || product.category)}</Link></li>}
            </ul>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-10">
            
            {/* Reviews Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border text-center h-full">
                <h3 className="text-5xl font-serif font-bold text-foreground mb-2">{reviewStats.average_rating.toFixed(1)}</h3>
                <div className="flex items-center text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(reviewStats.average_rating) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Based on {reviewStats.total_reviews} reviews</p>
              </div>
              
              <div className="md:col-span-5 space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviewStats.rating_distribution[star] || 0;
                  const percentage = calculatePercentage(count);
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-12 font-medium flex items-center gap-1">{star} <Star className="w-3 h-3 fill-muted-foreground text-muted-foreground" /></span>
                      <Progress value={percentage} className="h-2 flex-1 bg-muted" indicatorColor="bg-yellow-500" />
                      <span className="w-10 text-right text-muted-foreground">{percentage}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-3 flex flex-col justify-center h-full">
                {isAuthenticated() ? (
                  isVerifiedBuyer ? (
                    !showReviewForm && (
                      <Button onClick={() => setShowReviewForm(true)} className="w-full h-12">
                        Write a Review
                      </Button>
                    )
                  ) : (
                    <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Only verified buyers can leave a review.</p>
                    </div>
                  )
                ) : (
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link to="/login">Login to Review</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm 
                onSubmit={handleReviewSubmit} 
                onCancel={() => setShowReviewForm(false)} 
                isSubmitting={isSubmittingReview} 
              />
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-lg font-serif font-semibold">Customer Reviews</h3>
                <Select value={reviewsSort} onValueChange={setReviewsSort}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="highest_rated">Highest Rated</SelectItem>
                    <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
                    <SelectItem value="most_helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard 
                      key={review.id} 
                      review={review} 
                      onHelpfulClick={toggleHelpful} 
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {reviewsTotalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  <Button 
                    variant="outline" 
                    disabled={reviewsPage === 1}
                    onClick={() => setReviewsPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm font-medium">
                    Page {reviewsPage} of {reviewsTotalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={reviewsPage === reviewsTotalPages}
                    onClick={() => setReviewsPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

          </TabsContent>
        </Tabs>

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;