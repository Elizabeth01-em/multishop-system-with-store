import { Container, Typography, Box, Grid, Button, Card, CardContent, CardMedia } from '@mui/material';
import NextLink from 'next/link';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  uniqueProductCode: string;
  name: string;
  price: number;
  images?: Array<{ id: string; productId?: string; mimetype?: string; displayOrder?: number }>;
}

// Fetch data on the server, Next.js will cache this (SSG by default)
async function getFeaturedProducts() {
  try {
    // Adding timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const res = await fetch('http://localhost:3001/public/products', {
      signal: controller.signal,
      next: { revalidate: 30 } // Revalidate at most every 30 seconds
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.warn("Failed to fetch products, status:", res.status);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch products for homepage", error);
    // Return empty array as fallback
    return [];
  }
}

export default async function HomePage() {
  let allProducts = [];
  try {
    allProducts = await getFeaturedProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
  
  // Ensure we have an array before slicing
  const featuredProducts = Array.isArray(allProducts) ? allProducts.slice(0, 8) : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Banner */}
      <Box 
        sx={{ 
          backgroundColor: 'primary.main', 
          borderRadius: 3, 
          p: 6, 
          mb: 6,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
          Welcome to MultiShop
        </Typography>
        <Typography variant="h5" paragraph fontWeight={500} sx={{ mb: 4 }}>
          Discover amazing products from our curated collection
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={NextLink} 
          href="/products"
          sx={{ 
            backgroundColor: 'white', 
            color: 'primary.main',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={3} key={item}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 140, 
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={`https://via.placeholder.com/150?text=Category+${item}`}
                    alt={`Category ${item}`}
                    sx={{ maxWidth: '80%', maxHeight: '80%' }}
                  />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Category {item}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Products */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight={600}>
            Featured Products
          </Typography>
          <Button 
            component={NextLink} 
            href="/products"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          >
            View All
          </Button>
        </Box>
        
        {featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.map((product: Product) => (
              <Grid item key={product.uniqueProductCode || `product-${Math.random()}`} xs={12} sm={6} md={3}>
                <ProductCard product={{
                  id: product.uniqueProductCode || '', // Add the missing id property
                  ...product, 
                  price: product.price?.toString() || '0',
                  images: product.images?.map(img => ({
                    id: img.id,
                    productId: img.productId || product.uniqueProductCode || '',
                    mimetype: img.mimetype || 'image/jpeg',
                    displayOrder: img.displayOrder || 0
                  })) || []
                }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No products available at the moment. Please check back later.
          </Typography>
        )}
      </Box>

      {/* Promotional Banner */}
      <Box 
        sx={{ 
          backgroundColor: 'secondary.main', 
          borderRadius: 3, 
          p: 4, 
          mb: 6,
          textAlign: 'center',
          color: 'white'
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Summer Sale is Live!
        </Typography>
        <Typography variant="h6" paragraph fontWeight={500} sx={{ mb: 3 }}>
          Up to 50% off on selected items. Limited time offer.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={NextLink} 
          href="/products"
          sx={{ 
            backgroundColor: 'white', 
            color: 'secondary.main',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          Shop the Sale
        </Button>
      </Box>
    </Container>
  );
}