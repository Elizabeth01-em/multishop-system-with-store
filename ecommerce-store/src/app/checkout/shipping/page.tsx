// src/app/checkout/shipping/page.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, TextField, Button, Grid, Box } from '@mui/material';
import { useCartStore } from '@/store/cartStore';

export default function ShippingPage() {
    const router = useRouter();
    const { shippingDetails, setShippingDetails } = useCartStore();
    
    // Use local state to manage the form, initialized from the global store
    const [formData, setFormData] = useState(shippingDetails);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save the form data to the global Zustand store
        setShippingDetails(formData);
        // Navigate to the next step
        router.push('/checkout/payment');
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Shipping & Contact Information
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField required fullWidth label="Full Name" name="customerName" value={formData.customerName} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth label="Email Address" type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth label="Shipping Address" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField required fullWidth label="Mobile Number (e.g., Tigo, Airtel)" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" fullWidth size="large">
                            Continue to Payment
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}