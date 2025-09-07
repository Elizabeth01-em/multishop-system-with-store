// src/app/search/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  Chip,
  Button
} from '@mui/material';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';
import SearchIcon from '@mui/icons-material/Search';

// Define the Product interface that matches what ProductCard expects
interface ProductCardProduct {
  id: string;
  uniqueProductCode: string;
  name: string;
  price: string;
  images?: Array<{
    id: string;
    productId: string;
    mimetype: string;
    displayOrder: number;
  }>;
}

// Mock product data for search results
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 89.99,
    uniqueProductCode: 'PROD-001',
    isActive: true,
    categoryId: 'CAT-001'
  },
  {
    id: '2',
    name: 'Smartphone Case',
    description: 'Durable protective case for smartphones',
    price: 19.99,
    uniqueProductCode: 'PROD-002',
    isActive: true,
    categoryId: 'CAT-002'
  },
  {
    id: '3',
    name: 'Fitness Tracker',
    description: 'Track your steps, heart rate, and sleep patterns',
    price: 49.99,
    uniqueProductCode: 'PROD-003',
    isActive: true,
    categoryId: 'CAT-003'
  },
  {
    id: '4',
    name: 'Coffee Maker',
    description: 'Automatic drip coffee maker with programmable timer',
    price: 59.99,
    uniqueProductCode: 'PROD-004',
    isActive: true,
    categoryId: 'CAT-004'
  },
  {
    id: '5',
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness settings',
    price: 34.99,
    uniqueProductCode: 'PROD-005',
    isActive: true,
    categoryId: 'CAT-005'
  },
  {
    id: '6',
    name: 'Backpack',
    description: 'Water-resistant backpack with laptop compartment',
    price: 39.99,
    uniqueProductCode: 'PROD-006',
    isActive: true,
    categoryId: 'CAT-006'
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState('relevance');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort products
  const sortedProducts = [...filteredProducts];
  switch (sortOption) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // Relevance - default order
      break;
  }
  
  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Map to Product format expected by ProductCard component
  const productCards: ProductCardProduct[] = paginatedProducts.map(product => ({
    id: product.id,
    uniqueProductCode: product.uniqueProductCode,
    name: product.name,
    price: product.price.toString(), // Convert number to string for ProductCard
    // Note: images property is optional in ProductCard's Product interface
  }));
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
    setPage(1); // Reset to first page when sort changes
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Search Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {filteredProducts.length} results for &quot;{searchQuery}&quot;
        </Typography>
      </Box>
      
      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="medium"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
          }}
        />
      </Box>
      
      {/* Filters and Sorting */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2, 
        mb: 4,
        alignItems: { md: 'center' }
      }}>
        {/* Active Search Filter */}
        <Chip 
          label={`Search: ${searchQuery}`} 
          variant="outlined" 
          onDelete={() => setSearchQuery('')} 
        />
        
        <Box sx={{ flexGrow: 1 }} />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOption}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="name">Name A-Z</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Results */}
      {productCards.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {productCards.map((product) => (
              <Grid item key={product.uniqueProductCode} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="medium"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try different search terms
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </Button>
        </Box>
      )}
    </Container>
  );
}