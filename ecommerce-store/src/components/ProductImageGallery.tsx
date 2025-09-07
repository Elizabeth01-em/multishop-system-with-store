// src/components/ProductImageGallery.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import Image from 'next/image';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

interface ProductImage {
  id: string;
  productId: string;
  mimetype: string;
  displayOrder: number;
}

interface Product {
  name: string;
  images?: ProductImage[];
}

interface ProductImageGalleryProps {
  product: Product;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product }) => {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    // Reset to first image when product changes
    setMainImageIndex(0);
  }, [product]);

  // If no images, use placeholder
  const hasImages = product.images && product.images.length > 0;
  const images: ProductImage[] = hasImages ? product.images! : [{ id: 'placeholder', productId: '', mimetype: '', displayOrder: 0 }];
  
  const mainImageUrl = hasImages 
    ? `http://localhost:3001/public/images/${images![mainImageIndex].id}`
    : `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name)}`;

  const handlePrevImage = () => {
    setMainImageIndex(prev => (prev > 0 ? prev - 1 : (images?.length || 1) - 1));
  };

  const handleNextImage = () => {
    setMainImageIndex(prev => (prev < (images?.length || 1) - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setMainImageIndex(index);
  };

  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Image */}
      <Paper 
        sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 300, sm: 400, md: 500 }
        }}
      >
        <Image
          src={mainImageUrl}
          alt={product.name}
          fill
          style={{ 
            objectFit: 'contain',
            cursor: 'zoom-in',
            transform: zoomed ? 'scale(1.5)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}
          onClick={toggleZoom}
        />
        
        {/* Navigation Arrows */}
        {images!.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 10,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 10,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </>
        )}
        
        {/* Zoom Button */}
        <IconButton
          onClick={toggleZoom}
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
          }}
        >
          <ZoomInIcon />
        </IconButton>
      </Paper>
      
      {/* Thumbnails */}
      {images!.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {images!.map((image, index) => (
            <Paper
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                width: 70, 
                height: 70, 
                cursor: 'pointer', 
                overflow: 'hidden',
                border: mainImageIndex === index ? '2px solid' : '2px solid transparent',
                borderColor: 'primary.main',
                flexShrink: 0
              }}
            >
              <Image
                src={hasImages 
                  ? `http://localhost:3001/public/images/${image.id}`
                  : `https://via.placeholder.com/70x70.png?text=Image+${index + 1}`
                }
                alt={`Thumbnail ${index + 1}`}
                width={70}
                height={70}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};