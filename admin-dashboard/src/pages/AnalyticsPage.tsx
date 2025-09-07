/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Grid, Paper, ToggleButtonGroup, ToggleButton, Box, CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR
import { formatCurrency } from '../utils/currency';

// ===== Chart Components =====

const SalesTrendChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(tick) => formatCurrency(tick)} />
            <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
            <Legend />
            <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
    </ResponsiveContainer>
);

const ShopPerformanceChart = ({ data }: { data: any[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shopName" />
            <YAxis tickFormatter={(tick) => formatCurrency(tick)} />
            <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#82ca9d" />
        </BarChart>
    </ResponsiveContainer>
);


// ===== Main Page Component =====

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for each data set
  const [salesByPeriod, setSalesByPeriod] = useState<any[]>([]);
  const [shopPerformance, setShopPerformance] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // State for controlling the sales trend chart
  const [salesRange, setSalesRange] = useState('30d');

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [salesRes, performanceRes, topProductsRes] = await Promise.all([
        api.get('/reports/sales-by-period', { params: { range: salesRange } }),
        api.get('/reports/performance-by-shop'),
        api.get('/reports/top-products')
      ]);

      setSalesByPeriod(salesRes.data);
      setShopPerformance(performanceRes.data);
      setTopProducts(topProductsRes.data);

    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  }, [salesRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);
  
  const handleRangeChange = (event: React.MouseEvent<HTMLElement>, newRange: string | null) => {
    if (newRange) {
        setSalesRange(newRange);
    }
  };
  
  const topProductsColumns: GridColDef[] = [
    { field: 'productName', headerName: 'Product Name', flex: 1 },
    { field: 'uniqueProductCode', headerName: 'Code', width: 150 },
    { field: 'totalQuantitySold', headerName: 'Total Sold', type: 'number', width: 130 },
  ];
  
  if (loading) {
      return <Layout><CircularProgress /></Layout>;
  }

  if(error) {
      return <Layout><Alert severity="error">{error}</Alert></Layout>;
  }

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Business Analytics</Typography>
      </Box>
      
      {/* Sales Trend Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Sales Revenue Trend</Typography>
                  <ToggleButtonGroup
                      value={salesRange}
                      exclusive
                      onChange={handleRangeChange}
                      size="small"
                  >
                      <ToggleButton value="7d">7 Days</ToggleButton>
                      <ToggleButton value="30d">30 Days</ToggleButton>
                      <ToggleButton value="90d">90 Days</ToggleButton>
                  </ToggleButtonGroup>
              </Box>
              <SalesTrendChart data={salesByPeriod} />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Shop Performance Section */}
        <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Performance by Shop</Typography>
                    <ShopPerformanceChart data={shopPerformance} />
                </CardContent>
            </Card>
        </Grid>

        {/* Top Products Table Section */}
        <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
                 <CardContent sx={{ p: 2, pb: 0 }}>
                   <Typography variant="h6" gutterBottom>Top Selling Products (All Time)</Typography>
                 </CardContent>
                 <Paper sx={{ 
                   flexGrow: 1,
                   border: 0,
                   '& .MuiDataGrid-columnHeaders': {
                     backgroundColor: 'grey.100',
                   },
                   '& .MuiDataGrid-row:nth-of-type(odd)': {
                     backgroundColor: 'grey.50',
                   },
                   '& .MuiDataGrid-row:hover': {
                     backgroundColor: 'grey.100',
                   }
                 }}>
                   <DataGrid 
                      rows={topProducts}
                      columns={topProductsColumns}
                      getRowId={(row) => row.uniqueProductCode}
                      sx={{ border: 0 }}
                      // ADD COMPONENTS AND COMPONENTSPROPS HERE
                      components={{ Toolbar: ExportToolbar }}
                      componentsProps={{
                        toolbar: {
                          data: topProducts,
                          columns: topProductsColumns,
                          filename: 'top_products_report',
                        },
                      }}
                   />
                 </Paper>
            </Card>
        </Grid>

      </Grid>
    </Layout>
  );
};

export default AnalyticsPage;