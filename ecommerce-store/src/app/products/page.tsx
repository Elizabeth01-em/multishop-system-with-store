// src/app/products/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  TextField,
  Pagination,
  Chip,
  Button
} from '@mui/material';
import { ProductCard } from '@/components/ProductCard';
import { Product} from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import FilterListIcon from '@mui/icons-material/FilterList';

// Fetch data on every request (SSR)
async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://localhost:3001/public/products', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    };
    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => product.categoryId === selectedCategory);
    }
    
    // Apply price filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured - default order
        break;
    }
    
    setFilteredProducts(result);
    setPage(1); // Reset to first page when filters change
  }, [products, sortOption, priceRange, selectedCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Map backend product data to Product format for ProductCard component
  const productCards = paginatedProducts.map(product => ({
    id: product.id,
    uniqueProductCode: product.uniqueProductCode,
    name: product.name,
    price: product.price.toString()
  }));

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          All Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredProducts.length} products
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2, 
        mb: 4,
        alignItems: { md: 'center' }
      }}>
        <TextField
          label="Search products"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOption}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="featured">Featured</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="name">Name A-Z</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          More Filters
        </Button>
      </Box>

      {/* Active Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip 
          label={`Price: ${formatCurrency(priceRange[0])} - ${formatCurrency(priceRange[1])}`} 
          variant="outlined" 
          onDelete={() => setPriceRange([0, 1000])} 
        />
        {searchQuery && (
          <Chip 
            label={`Search: ${searchQuery}`} 
            variant="outlined" 
            onDelete={() => setSearchQuery('')} 
          />
        )}
      </Box>

      {/* Products Grid */}
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
                size="large"
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
            Try adjusting your filters or search terms
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSearchQuery('');
              setSortOption('featured');
              setPriceRange([0, 1000]);
              setSelectedCategory('');
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}