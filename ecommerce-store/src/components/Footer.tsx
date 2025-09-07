// src/components/Footer.tsx
import { Box, Typography, Container, Grid, Link } from '@mui/material';
import NextLink from 'next/link';

export const Footer = () => (
  <Box 
    component="footer" 
    sx={{ 
      bgcolor: 'background.paper', 
      py: 6, 
      mt: 'auto',
      borderTop: '1px solid #eee'
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Company Info */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            MultiShop
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your one-stop destination for quality products at competitive prices.
          </Typography>
        </Grid>
        
        {/* Customer Service */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Customer Service
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/contact" color="inherit" underline="hover">
              Contact Us
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/faq" color="inherit" underline="hover">
              FAQ
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/returns" color="inherit" underline="hover">
              Returns & Exchanges
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/shipping" color="inherit" underline="hover">
              Shipping Info
            </Link>
          </Typography>
        </Grid>
        
        {/* Account */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            My Account
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/profile" color="inherit" underline="hover">
              My Profile
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/orders" color="inherit" underline="hover">
              Order History
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link component={NextLink} href="/wishlist" color="inherit" underline="hover">
              Wishlist
            </Link>
          </Typography>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} MultiShop. All Rights Reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link component={NextLink} href="/privacy" color="inherit" underline="hover" sx={{ mr: 2 }}>
            Privacy Policy
          </Link>
          <Link component={NextLink} href="/terms" color="inherit" underline="hover">
            Terms of Service
          </Link>
        </Typography>
      </Box>
    </Container>
  </Box>
);