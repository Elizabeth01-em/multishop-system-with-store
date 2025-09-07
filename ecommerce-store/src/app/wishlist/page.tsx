// src/app/wishlist/page.tsx
'use client';

import { Container, Typography, Grid, Button, Box } from '@mui/material';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductCard } from '@/components/ProductCard';
import NextLink from 'next/link';

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlistStore();

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        My Wishlist
      </Typography>
      
      {wishlistItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start adding products to your wishlist to save them for later
          </Typography>
          <Button 
            component={NextLink} 
            href="/products" 
            variant="contained" 
            size="large"
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </Typography>
            <Button 
              onClick={clearWishlist}
              color="error"
              variant="outlined"
            >
              Clear Wishlist
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard 
                  product={{
                    id: item.id,
                    uniqueProductCode: item.uniqueProductCode,
                    name: item.name,
                    price: item.price.toString(),
                    images: item.image ? [{ 
                      id: item.id, 
                      productId: item.id, 
                      mimetype: 'image/jpeg', 
                      displayOrder: 0 
                    }] : undefined
                  }} 
                />
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Button 
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    color="error"
                    size="small"
                  >
                    Remove from Wishlist
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}