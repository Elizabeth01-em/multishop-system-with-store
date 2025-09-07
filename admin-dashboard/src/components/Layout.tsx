/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Layout.tsx
import React, { ReactNode, useState, useEffect, MouseEvent, useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  CssBaseline,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Menu,
  IconButton,
  Tooltip,
  useMediaQuery,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Import the icons we will use for our navigation
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BusinessIcon from '@mui/icons-material/Business'; // Shop icon
import GroupIcon from '@mui/icons-material/Group';       // User/Employee icon
import BarChartIcon from '@mui/icons-material/BarChart'; // Icon for Analytics
import DnsIcon from '@mui/icons-material/Dns'; // Icon for Global Inventory
import CategoryIcon from '@mui/icons-material/Category'; // Icon for Products
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // <-- A fallback icon
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const drawerWidth = 240; // Define the width of our sidebar
const miniDrawerWidth = 72; // Width when collapsed

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, user, selectedShopId, setSelectedShopId } = useAuth(); // <-- Get new state
  const [shops, setShops] = useState<any[]>([]);
  const location = useLocation(); // Hook to get the current URL path
  
  // State for the user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // State for collapsible sidebar
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const handleMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Toggle sidebar state
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleDrawerToggle = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Fetch all shops for the dropdown if user is owner
  useEffect(() => {
    if (user?.role === 'OWNER') {
        const fetchShops = async () => {
            try {
                const response = await api.get('/shops');
                setShops(response.data);
                // Set a default selected shop if none is chosen
                if (!selectedShopId && response.data.length > 0) {
                    setSelectedShopId(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch shops");
            }
        }
        fetchShops();
    }
  }, [user, selectedShopId, setSelectedShopId]);

  // Create the base navigation items for everyone
  const baseNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Transfers', icon: <SwapHorizIcon />, path: '/transfers' },
  ];

  // Create the owner-only navigation items
  const ownerNavItems = [
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Global Stock', icon: <DnsIcon />, path: '/global-inventory' },
    { text: 'Product Catalog', icon: <CategoryIcon />, path: '/products-admin' },
    { text: 'Shop Management', icon: <BusinessIcon />, path: '/shops' },
    { text: 'Employee Management', icon: <GroupIcon />, path: '/users' },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/settings' }, // <-- Add this
  ];

  // Conditionally combine the navigation items based on the user's role
  const navItems = user?.role === 'OWNER'
    ? [...baseNavItems, ...ownerNavItems]
    : baseNavItems;

  // Memoize drawer variant to prevent unnecessary re-renders
  const drawerVariant = useMemo(() => {
    if (isMobile) {
      return 'temporary';
    }
    return 'permanent';
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen && !isMobile ? drawerWidth : miniDrawerWidth}px)` },
          ml: { md: `${sidebarOpen && !isMobile ? drawerWidth : miniDrawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={toggleSidebar}
              edge="start"
              sx={{ mr: 2 }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Shop Management Portal
          </Typography>
          
          {/* OWNER-ONLY SHOP SELECTOR */}
          {user?.role === 'OWNER' && shops.length > 0 && (
            <FormControl sx={{ m: 1, minWidth: 200, color: 'white' }} size="small">
              <InputLabel id="shop-selector-label" sx={{ color: 'white' }}>Viewing Shop</InputLabel>
              <Select
                labelId="shop-selector-label"
                value={selectedShopId || ''}
                label="Viewing Shop"
                onChange={(e) => setSelectedShopId(e.target.value as string)}
                sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                {shops.map(shop => <MenuItem key={shop.id} value={shop.id}>{shop.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {/* ===== REPLACEMENT FOR WELCOME TEXT AND LOGOUT BUTTON ===== */}
          <Box sx={{ flexGrow: 1 }} /> {/* This pushes the user menu to the right */}
          
          <Typography>{user?.email}</Typography>
          
          <IconButton
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
              <ListItemIcon><SettingsIcon fontSize="small"/></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); logout(); }}>
               <ListItemIcon><LogoutIcon fontSize="small"/></ListItemIcon>
               Logout
            </MenuItem>
          </Menu>
          {/* ======================================================== */}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={drawerVariant}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: sidebarOpen ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? drawerWidth : miniDrawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
              Multi-Shop System
          </Typography>
        </Toolbar>
        <Divider />

        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={RouterLink}
              to={item.path}
              // This is the logic for the "active link" styling
              selected={location.pathname === item.path} 
              sx={{
                minHeight: 48,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                },
              }}
            >
              <Tooltip title={!sidebarOpen ? item.text : ''} placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    ...(sidebarOpen ? {} : { mr: 'auto' }),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: sidebarOpen ? 1 : 0, 
                  transition: 'opacity 0.2s',
                  ...(sidebarOpen ? {} : { display: 'none' })
                }} 
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen && !isMobile ? drawerWidth : miniDrawerWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* This is a spacer to push content below the AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;