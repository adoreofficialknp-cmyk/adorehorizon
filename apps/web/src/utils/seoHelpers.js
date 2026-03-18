
export const generateProductSchema = (product) => {
  if (!product) return null;
  
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.[0] ? [product.images[0]] : [],
    "description": product.description || `Buy ${product.name} at ADORE Jewellery.`,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ADORE Jewellery",
    "url": "https://adorejewellery.com",
    "logo": "https://adorejewellery.com/logo.png",
    "sameAs": [
      "https://facebook.com/adorejewellery",
      "https://instagram.com/adorejewellery",
      "https://twitter.com/adorejewellery"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-123-4567",
      "contactType": "customer service"
    }
  };
};

export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://adorejewellery.com${item.url}`
    }))
  };
};

export const generateReviewSchema = (reviews, product) => {
  if (!reviews || reviews.length === 0 || !product) return null;

  const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length
    },
    "review": reviews.map(rev => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rev.rating
      },
      "author": {
        "@type": "Person",
        "name": rev.expand?.user_id?.name || "Anonymous"
      },
      "reviewBody": rev.comment
    }))
  };
};
