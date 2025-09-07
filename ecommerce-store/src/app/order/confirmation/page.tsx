// src/app/order/confirmation/page.tsx
'use client';
import React, { useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NextLink from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function OrderConfirmationPage() {
    const clearCart = useCartStore((state) => state.clearCart);

    // Clear the cart when the user lands on this page
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>Thank You For Your Order!</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Your order is being processed. Please follow the instructions sent to your phone to complete the payment. You will receive an email confirmation once the payment is successful.
                </Typography>
                <Button component={NextLink} href="/" variant="contained">
                    Continue Shopping
                </Button>
            </Box>
        </Container>
    );
}