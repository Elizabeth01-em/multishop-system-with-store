/* eslint-disable @next/next/no-img-element */
// src/app/cart/page.tsx
'use client';
import React from 'react';
import NextLink from 'next/link';
import {
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Grid, 
  Paper, 
  IconButton,
  Box,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/utils/currency';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  
  // FIX APPLIED HERE: Ensure price is treated as a number
  const subtotal = items.reduce((acc, item) => acc + parseFloat(String(item.price)) * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Your Shopping Cart
      </Typography>
      
      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven&apos;t added anything to your cart yet
          </Typography>
          <Button 
            component={NextLink} 
            href="/products" 
            variant="contained" 
            size="large"
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <List>
                {items.map(item => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ p: 0, mb: 3 }}>
                      {/* Product Image */}
                      <Box 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          backgroundColor: '#f5f5f5',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img 
                          src={`https://via.placeholder.com/80?text=Product`} 
                          alt={item.name} 
                          style={{ maxWidth: '80%', maxHeight: '80%' }}
                        />
                      </Box>
                      
                      {/* Product Details */}
                      <Box sx={{ flexGrow: 1 }}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" fontWeight={600}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(parseFloat(String(item.price)))}
                            </Typography>
                          }
                        />
                        
                        {/* Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            size="small"
                            sx={{ width: 50, mx: 1, textAlign: 'center' }}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            onClick={() => removeFromCart(item.id)}
                            sx={{ ml: 'auto' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {/* Item Total */}
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(parseFloat(String(item.price)) * item.quantity)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  component={NextLink} 
                  href="/products" 
                  variant="outlined"
                >
                  Continue Shopping
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => useCartStore.getState().clearCart()}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography>{formatCurrency(shipping)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax</Typography>
                  <Typography>{formatCurrency(tax)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700}>{formatCurrency(total)}</Typography>
                </Box>
              </Box>
              
              <Button 
                component={NextLink} 
                href="/checkout/shipping" 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ py: 1.5, mt: 2 }}
              >
                Proceed to Checkout
              </Button>
              
              <TextField
                placeholder="Discount code"
                fullWidth
                sx={{ mt: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button>Apply</Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}