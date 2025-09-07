// src/components/ProductCard.tsx
"use client";

import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Card, CardActionArea, CardContent, Typography, Box, Chip } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlistStore } from '../store/wishlistStore';
import { formatCurrency } from '@/utils/currency';

interface ProductImage {
  id: string;
  productId: string;
  mimetype: string;
  displayOrder: number;
}

interface Product {
  id: string;
  uniqueProductCode: string;
  name: string;
  price: string;
  images?: ProductImage[];
}

export const ProductCard = ({ product }: { product: Product }) => {
  // Ensure we have valid data
  const productName = product?.name || 'Unknown Product';
  const productPrice = product?.price || '0';
  const productCode = product?.uniqueProductCode || '';
  const productId = product?.id || '';

  // Use the first image if it exists, otherwise use a placeholder
  const imageUrl = product.images?.[0]?.id
    ? `http://localhost:3001/public/images/${product.images[0].id}`
    : `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(productName)}`;

  // Wishlist functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(productId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        uniqueProductCode: productCode,
        image: product.images?.[0]?.id 
          ? `http://localhost:3001/public/images/${product.images[0].id}`
          : undefined
      });
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardActionArea 
        component={NextLink} 
        href={productCode ? `/products/${productCode}` : '#'}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Product Image */}
        <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
          <Image
            src={imageUrl}
            alt={productName}
            fill
            style={{ objectFit: 'cover' }}
          />
          {/* Wishlist Icon */}
          <Box 
            onClick={handleWishlistToggle}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              backgroundColor: 'white',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon sx={{ fontSize: 18, color: 'red' }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18, color: 'gray' }} />
            )}
          </Box>
        </Box>
        
        {/* Product Info */}
        <CardContent sx={{ flexGrow: 1, pt: 2 }}>
          <Typography 
            gutterBottom 
            variant="body1" 
            component="div"
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.3,
              height: '2.6em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {productName}
          </Typography>
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', mr: 1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Box 
                  key={star} 
                  component="span" 
                  sx={{ 
                    color: star <= 4 ? 'warning.main' : 'grey.300',
                    fontSize: '0.8rem'
                  }}
                >
                  ★
                </Box>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              (128)
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {formatCurrency(parseFloat(productPrice || '0'))}
            </Typography>
            <Chip 
              label="Free Shipping" 
              size="small" 
              sx={{ 
                backgroundColor: 'success.light', 
                color: 'success.dark',
                fontWeight: 600,
                height: 20
              }} 
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};