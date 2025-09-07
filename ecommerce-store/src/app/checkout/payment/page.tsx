// src/app/checkout/payment/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Box, 
  CircularProgress, 
  Backdrop,
  TextField
} from '@mui/material';
import { useCartStore } from '@/store/cartStore';
import api from '@/utils/api';
// import { useNotification } from '@/contexts/NotificationContext'; // We should add this

export default function PaymentPage() {
  const router = useRouter();
  const { items, shippingDetails } = useCartStore();
  const [provider, setProvider] = useState('Tigo'); // Default provider
  const [loading, setLoading] = useState(false);
  
  // Note: For this to work, you would need to add NotificationProvider to your e-commerce layout
  // const { showNotification } = useNotification(); 
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    const orderPayload = {
      ...shippingDetails,
      provider,
      items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
    };

    try {
      await api.post('/orders/checkout/initiate', orderPayload);
      // On success, redirect to confirmation page
      router.push('/order/confirmation');
    } catch (err: any) {
      // showNotification(err.response?.data?.message || 'Failed to place order', 'error');
      alert(err.response?.data?.message || 'Failed to place order'); // Fallback to alert
      setLoading(false);
    }
  };

  return (
    <>
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color="inherit" />
              <Typography sx={{ mt: 2 }}>Processing your payment...</Typography>
              <Typography>Please follow the instructions on your phone.</Typography>
          </Box>
      </Backdrop>
    
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Payment</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Select Payment Method</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Mobile Provider</InputLabel>
                <Select 
                  value={provider} 
                  label="Mobile Provider" 
                  onChange={(e) => setProvider(e.target.value as string)}
                >
                  <MenuItem value="Airtel">Airtel</MenuItem>
                  <MenuItem value="Tigo">Tigo</MenuItem>
                  <MenuItem value="Halopesa">Halopesa</MenuItem>
                  <MenuItem value="Azampesa">Azampesa</MenuItem>
                  <MenuItem value="Mpesa">Mpesa</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                label="Mobile Number" 
                fullWidth 
                margin="normal" 
                value={shippingDetails?.accountNumber || ''} 
                disabled 
                helperText="This is the mobile number from your shipping details"
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              <List dense>
                {items.map(item => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={item.name} 
                          secondary={`Qty: ${item.quantity}`} 
                        />
                        <Typography variant="body2" fontWeight="medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </ListItem>
                ))}
              </List>
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
                <Typography variant="h6" align="right">
                  Total: ${subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Button 
                onClick={handlePlaceOrder} 
                variant="contained" 
                size="large" 
                fullWidth 
                sx={{ mt: 3 }} 
                disabled={loading || items.length === 0}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
              {items.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Your cart is empty
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}