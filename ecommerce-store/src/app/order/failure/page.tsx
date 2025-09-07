// src/app/order/failure/page.tsx
'use client';
import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import NextLink from 'next/link';

export default function OrderFailurePage() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom color="error">Payment Failed</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    There was an issue processing your payment. Please try again.
                </Typography>
                <Button component={NextLink} href="/cart" variant="contained">
                    Back to Cart
                </Button>
            </Box>
        </Container>
    );
}