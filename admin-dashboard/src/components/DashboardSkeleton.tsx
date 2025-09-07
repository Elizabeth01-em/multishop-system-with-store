// src/components/DashboardSkeleton.tsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Skeleton, // Import the Skeleton component
  List,
  ListItem,
} from '@mui/material';

export const DashboardSkeleton = () => {
  return (
    <Grid container spacing={3}>
      {/* Skeleton for Stat Card 1 */}
      <Grid item xs={12} sm={6} md={4}>
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
      
      {/* Skeleton for Stat Card 2 */}
      <Grid item xs={12} sm={6} md={4}>
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

      {/* Skeleton for Stat Card 3 */}
      <Grid item xs={12} sm={6} md={4}>
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

      {/* Skeleton for List Widget 1 (Top Sellers) */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
          borderRadius: 2 
        }}>
            <CardContent>
                <Skeleton variant="text" width="60%" sx={{ fontSize: '1.25rem', mb: 2 }} />
                <List disablePadding>
                    {/* Create a few placeholder list items */}
                    {[...Array(5)].map((_, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                            <Skeleton variant="text" width="80%" />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
      </Grid>
      
      {/* Skeleton for List Widget 2 (Low Stock) */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
          borderRadius: 2 
        }}>
            <CardContent>
                <Skeleton variant="text" width="60%" sx={{ fontSize: '1.25rem', mb: 2 }} />
                <List disablePadding>
                    {[...Array(5)].map((_, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                            <Skeleton variant="text" width="80%" />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};