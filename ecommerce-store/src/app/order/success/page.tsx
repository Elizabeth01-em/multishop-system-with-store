// src/app/order/success/page.tsx
'use client';
import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NextLink from 'next/link';

export default function OrderSuccessPage() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>Payment Successful!</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Your order has been confirmed and will be shipped soon.
                </Typography>
                <Button component={NextLink} href="/" variant="contained">
                    Continue Shopping
                </Button>
            </Box>
        </Container>
    );
}