// src/components/OwnerDashboardSkeleton.tsx
import { Grid, Skeleton, Card, CardContent } from '@mui/material';
import React from 'react';

export const OwnerDashboardSkeleton = () => (
    <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2,
            height: '100%'
          }}>
            <CardContent>
              <Skeleton variant="rectangular" height={105} sx={{ borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2,
            height: '100%'
          }}>
            <CardContent>
              <Skeleton variant="rectangular" height={105} sx={{ borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
    </Grid>
);