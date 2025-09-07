// src/components/DashboardWidgets.tsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Box,
  Chip,
} from '@mui/material';

// Import icons for the widgets
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Enhanced StatCard component with better design
const StatCard = ({ title, value, icon, color = 'primary', trend }: { title: string; value: number; icon: React.ReactNode; color?: string; trend?: string }) => (
    <Card sx={{ 
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        borderRadius: 2,
        height: '100%',
    }}>
        <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            p: 3
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="text.secondary" variant="subtitle2" gutterBottom fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ mt: 1 }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ 
                    bgcolor: `${color}.main`, 
                    color: 'white', 
                    width: 60, 
                    height: 60,
                    borderRadius: 2
                }}>
                    {icon}
                </Avatar>
            </Box>
            {trend && (
                <Box sx={{ mt: 2 }}>
                    <Chip 
                        label={trend} 
                        size="small" 
                        sx={{ 
                            bgcolor: color === 'error' ? 'error.light' : `${color}.light`,
                            color: color === 'error' ? 'error.dark' : `${color}.dark`,
                            fontWeight: 600
                        }} 
                    />
                </Box>
            )}
        </CardContent>
    </Card>
);


export const DashboardWidgets = ({ stats }: { stats: any }) => {
  return (
    <Grid container spacing={3}>
      {/* Pending Orders Widget */}
      <Grid item xs={12} sm={6} md={4}>
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={<PendingActionsIcon />} 
          color="info"
          trend={`${stats.pendingOrders > 0 ? 'Needs attention' : 'All clear'}`}
        />
      </Grid>
      
      {/* Low Stock Items Count Widget */}
      <Grid item xs={12} sm={6} md={4}>
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockItems.length} 
          icon={<WarningAmberIcon />} 
          color="error"
          trend={`${stats.lowStockItems.length > 0 ? `${stats.lowStockItems.length} items` : 'All good'}`}
        />
      </Grid>

      {/* Top Sellers Widget */}
      <Grid item xs={12} md={4}>
        <StatCard 
          title="Top Sellers" 
          value={stats.topSellers.length} 
          icon={<TrendingUpIcon />} 
          color="success"
          trend={`${stats.topSellers.length > 0 ? 'Active sales' : 'No activity'}`}
        />
      </Grid>

      {/* Top Sellers List Widget */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2,
            height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight={600}>Top Sellers (Last 7 Days)</Typography>
            </Box>
            <List disablePadding>
              {stats.topSellers.slice(0, 5).map((item: any) => (
                <ListItem key={item.productId} disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={500}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Code: {item.uniqueProductCode}
                      </Typography>
                    }
                  />
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    {item.totalSold} sold
                  </Typography>
                </ListItem>
              ))}
              {stats.topSellers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    No sales recorded recently.
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Low Stock Items List Widget */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2,
            height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6" fontWeight={600}>Urgent: Low Stock Items</Typography>
            </Box>
            <List disablePadding>
              {stats.lowStockItems.slice(0, 5).map((item: any) => (
                <ListItem key={item.id} disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={500}>
                        {item.product.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Code: {item.product.uniqueProductCode}
                      </Typography>
                    }
                  />
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    Stock: {item.quantity}
                  </Typography>
                </ListItem>
              ))}
              {stats.lowStockItems.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    All stock levels are healthy.
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};