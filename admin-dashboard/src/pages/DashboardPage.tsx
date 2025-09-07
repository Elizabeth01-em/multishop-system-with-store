// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Alert, Box } from '@mui/material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

import { DashboardWidgets as EmployeeWidgets } from '../components/DashboardWidgets'; 
import { DashboardSkeleton as EmployeeSkeleton } from '../components/DashboardSkeleton';
import { OwnerDashboardWidgets } from '../components/OwnerDashboardWidgets'; // <-- Import real component
import { OwnerDashboardSkeleton } from '../components/OwnerDashboardSkeleton';   // <-- Import real component

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      
      try {
        if (user.role === 'OWNER') {
          // Fetch both reports for owner
          const [salesRes, inventoryRes] = await Promise.all([
              api.get('/reports/sales-overview'),
              api.get('/reports/inventory-overview'),
          ]);
          setStats({ sales: salesRes.data, inventory: inventoryRes.data });
        } else if (user.shopId) {
          // Fetch shop-specific stats for employee
          const response = await api.get(`/dashboard/stats/${user.shopId}`);
          setStats(response.data);
        } else {
            setError('User role is not recognized or shop is not assigned.');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const renderDashboard = () => {
    if (loading) {
        return user?.role === 'OWNER' ? <OwnerDashboardSkeleton /> : <EmployeeSkeleton />;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>
    }
    if (stats) {
        return user?.role === 'OWNER' ? <OwnerDashboardWidgets stats={stats} /> : <EmployeeWidgets stats={stats} />;
    }
    return null;
  }

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
      </Box>
      {renderDashboard()}
    </Layout>
  );
};

export default DashboardPage;