// src/app/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/my-orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'primary';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // If user is not authenticated, show a message
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please sign in to view order details
          </Typography>
          <Button 
            variant="contained" 
            href="/login" 
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          Order Details
        </Typography>
        <Button 
          component={NextLink} 
          href="/orders" 
          variant="outlined"
        >
          Back to Orders
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Order #{order.orderNumber || order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status) as never} 
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Shipping Address
            </Typography>
            {order.shippingAddress ? (
              <>
                <Typography variant="body1">
                  {order.shippingAddress.name}
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress.street}
                </Typography>
                <Typography variant="body1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No shipping address provided
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Payment Method
            </Typography>
            <Typography variant="body1">
              Payment upon delivery
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight={500}>
                      {item.productName || 'Product Name'}
                    </Typography>
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6" fontWeight={600}>
                    Order Total
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontWeight={600}>
                    ${order.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}