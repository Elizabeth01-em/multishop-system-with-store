'use client';

import { useState } from 'react';
import { Grid, Typography, Box, Button, Chip, Rating, TextField, Avatar, Divider } from '@mui/material';
import { AddToCart } from './AddToCart';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import NextLink from 'next/link';
import { formatCurrency } from '@/utils/currency';

// Define interfaces for our data structures
interface InventoryItem {
  id: string;
  quantity: number;
  lowStockThreshold: number;
  productId: string;
  shopId: string;
  shop: {
    id: string;
    name: string;
    location: string;
  };
}

interface ProductImage {
  id: string;
  productId: string;
  mimetype: string;
  displayOrder: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  uniqueProductCode: string;
  isActive: boolean;
  categoryId: string;
  inventory?: InventoryItem[];
  images?: ProductImage[];
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellent product! Highly recommend to everyone.',
    author: 'John Doe',
    date: '2023-05-15'
  },
  {
    id: '2',
    rating: 4,
    comment: 'Very good quality, but shipping took a bit longer than expected.',
    author: 'Jane Smith',
    date: '2023-04-22'
  },
  {
    id: '3',
    rating: 5,
    comment: 'Perfect! Exactly what I was looking for.',
    author: 'Robert Johnson',
    date: '2023-03-10'
  }
];

// Separate component for rating display
function ProductRating({ reviews }: { reviews: Review[] }) {
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Rating value={averageRating} readOnly precision={0.5} />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
        {averageRating.toFixed(1)} ({reviews.length} reviews)
      </Typography>
    </Box>
  );
}

// Separate component for reviews section
function ProductReviews({ reviews }: { reviews: Review[] }) {
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log('Submitting review:', { rating, comment });
    // Reset form
    setRating(5);
    setComment('');
    alert('Thank you for your review!');
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
        Customer Reviews
      </Typography>
      
      <Grid container spacing={4}>
        {/* Review Form */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>
          <Box component="form" onSubmit={handleSubmitReview}>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
            >
              Submit Review
            </Button>
          </Box>
        </Grid>
        
        {/* Reviews List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Recent Reviews
          </Typography>
          {reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                  {review.author.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{review.author}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {review.date}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2">{review.comment}</Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export function ProductDetailClient({ product }: { product: Product }) {
  // Calculate total stock across all shops
  const totalStock = product.inventory?.reduce((sum: number, inv: InventoryItem) => sum + inv.quantity, 0) || 0;

  // Mock related products data
  const relatedProducts = [
    { uniqueProductCode: 'RP001', name: 'Related Product 1', price: '29.99' },
    { uniqueProductCode: 'RP002', name: 'Related Product 2', price: '39.99' },
    { uniqueProductCode: 'RP003', name: 'Related Product 3', price: '49.99' },
    { uniqueProductCode: 'RP004', name: 'Related Product 4', price: '19.99' },
  ];

  return (
    <>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          component={NextLink} 
          href="/products" 
          sx={{ 
            color: 'text.secondary', 
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Products
        </Typography>
        <span style={{ color: 'text.secondary', margin: '0 8px' }}>/</span>
        <Typography component="span" color="text.primary">
          {product.name}
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <ProductImageGallery product={product} />
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {product.name}
          </Typography>

          {/* Rating */}
          <ProductRating reviews={mockReviews} />

          {/* Price */}
          <Typography variant="h4" color="primary" gutterBottom fontWeight={700}>
            {formatCurrency(parseFloat(product.price.toString()))}
          </Typography>

          {/* Stock Status */}
          <Box sx={{ mb: 3 }}>
            {totalStock > 0 ? (
              <Chip 
                label={`In Stock (${totalStock} available)`} 
                color="success" 
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip 
                label="Out of Stock" 
                color="error" 
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Description */}
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {product.description || 'No description available for this product.'}
          </Typography>

          {/* Add to Cart */}
          <AddToCart product={product} />

          {/* Product Meta */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Product Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>SKU:</strong> {product.uniqueProductCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Category:</strong> {product.categoryId || 'Uncategorized'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <ProductReviews reviews={mockReviews} />

      {/* Related Products */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
          Related Products
        </Typography>
        <Grid container spacing={3}>
          {relatedProducts.map((relatedProduct) => (
            <Grid item key={relatedProduct.uniqueProductCode} xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  border: '1px solid #eee', 
                  borderRadius: 2, 
                  p: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    height: 120, 
                    backgroundColor: '#f5f5f5', 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={`https://via.placeholder.com/100?text=${encodeURIComponent(relatedProduct.name)}`} 
                    alt={relatedProduct.name} 
                    style={{ maxWidth: '80%', maxHeight: '80%' }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {relatedProduct.name}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={700}>
                  {formatCurrency(parseFloat(relatedProduct.price))}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}