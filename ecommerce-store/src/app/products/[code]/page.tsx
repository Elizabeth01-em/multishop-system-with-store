/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-async-client-component */
// src/app/products/[code]/page.tsx

import { Container, Typography, Button } from '@mui/material';
import NextLink from 'next/link';
import { ProductDetailClient } from '@/components/ProductDetailClient';

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

// Generate static pages for all known products at build time
export async function generateStaticParams() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch('http://localhost:3001/public/products', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return [];
    const products = await res.json();
    return products.map((product: Product) => ({
      code: product.uniqueProductCode,
    }));
  } catch (error) {
    console.error("Failed to fetch products for static generation", error);
    return [];
  }
}

// Fetch data for a single product
async function getProduct(code: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`http://localhost:3001/public/products/${code}`, {
      signal: controller.signal,
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch product ${code}`, error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { code: string } }) {
  const product = await getProduct(params.code);

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Product Not Found
        </Typography>
        <Typography variant="body1">
          The product with code &quot;{params.code}&quot; could not be found or is currently unavailable.
        </Typography>
        <Button 
          component={NextLink} 
          href="/products" 
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ProductDetailClient product={product} />
    </Container>
  );
}
