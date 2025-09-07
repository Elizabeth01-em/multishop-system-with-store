'use client';
import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

// Define types for our data
interface Category {
  id: string;
  name: string;
  description: string;
}

// Default categories as fallback
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories' },
  { id: '2', name: 'Clothing', description: 'Fashion and apparel' },
  { id: '3', name: 'Home & Garden', description: 'Home improvement and gardening' },
  { id: '4', name: 'Sports', description: 'Sports and outdoor equipment' },
  { id: '5', name: 'Books', description: 'Books and educational materials' }
];

export const Header = () => {
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, logout } = useAuth();
  const router = useRouter();

  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  // State for category menu
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    // Fetch categories when the component mounts
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await api.get('/public/categories');
        
        // Check if response has data and it's an array
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        } else {
          console.warn('No categories returned from API, using default categories');
          // Keep using default categories
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        
        // More specific error logging
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        
        // Keep using default categories as fallback
        console.info('Using default categories as fallback');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAccountAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAccountAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    handleMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'white', 
        color: 'black',
        py: 1
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Typography 
          variant="h5" 
          component={NextLink} 
          href="/" 
          sx={{ 
            color: 'primary.main', 
            textDecoration: 'none', 
            fontWeight: 700,
            fontSize: '1.8rem'
          }}
        >
          MultiShop
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={handleMenuOpen} 
            startIcon={<CategoryIcon />}
            sx={{ fontWeight: 600 }}
            disabled={isLoadingCategories}
          >
            {isLoadingCategories ? 'Loading...' : 'Categories'}
          </Button>
          <Button 
            color="inherit" 
            component={NextLink} 
            href="/products"
            sx={{ fontWeight: 600 }}
          >
            All Products
          </Button>
        </Box>

        {/* Central Search Bar */}
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit} 
          sx={{ 
            flexGrow: 1, 
            mx: { xs: 1, md: 4 }, 
            maxWidth: { md: '500px' }
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                backgroundColor: '#f5f5f5', 
                borderRadius: 3,
                height: 40
              } 
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'gray' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {/* Navigation & Cart */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            component={NextLink} 
            href="/wishlist" 
            color="inherit"
            sx={{ position: 'relative' }}
          >
            <Badge 
              badgeContent={wishlistItems.length} 
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  right: 2,
                  top: 2
                }
              }}
            >
              <FavoriteIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            component={NextLink} 
            href="/cart" 
            color="inherit"
            sx={{ position: 'relative' }}
          >
            <Badge 
              badgeContent={items.reduce((acc, item) => acc + item.quantity, 0)} 
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  right: 2,
                  top: 2
                }
              }}
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          
          <Tooltip title="Account">
            <IconButton 
              color="inherit" 
              onClick={handleAccountMenuOpen}
              sx={{ ml: 1 }}
            >
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={accountAnchorEl}
            open={Boolean(accountAnchorEl)}
            onClose={handleAccountMenuClose}
            sx={{ mt: 1 }}
          >
            {user ? [
                <MenuItem key="profile" component={NextLink} href="/profile" onClick={handleAccountMenuClose}>
                  My Profile
                </MenuItem>,
                <MenuItem key="orders" component={NextLink} href="/orders" onClick={handleAccountMenuClose}>
                  My Orders
                </MenuItem>,
                <MenuItem key="wishlist" component={NextLink} href="/wishlist" onClick={handleAccountMenuClose}>
                  Wishlist
                </MenuItem>,
                <Divider key="divider" />,
                <MenuItem key="logout" onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              ] : [
                <MenuItem key="login" component={NextLink} href="/login" onClick={handleAccountMenuClose}>
                  Sign In
                </MenuItem>,
                <MenuItem key="register" component={NextLink} href="/register" onClick={handleAccountMenuClose}>
                  Register
                </MenuItem>
              ]
            }
          </Menu>
        </Box>
      </Toolbar>
      
      {/* Category Menu (both desktop and mobile) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ mt: 1 }}
      >
        {categories.map((cat) => (
          <MenuItem 
            key={cat.id}
            onClick={() => handleCategoryClick(cat.name)}
          >
            {cat.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem 
          component={NextLink} 
          href="/products" 
          onClick={handleMenuClose}
          sx={{ fontWeight: 600 }}
        >
          View All Products
        </MenuItem>
      </Menu>
    </AppBar>
  );
};