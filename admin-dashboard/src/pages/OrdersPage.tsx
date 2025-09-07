// src/pages/OrdersPage.tsx
import React, { useEffect, useState, useCallback, MouseEvent } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton, 
  Card,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { OrderFormModal } from '../components/OrderFormModal';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR
import { formatCurrency } from '../utils/currency';

// Type can no longer be null to match the ToggleButton
type StatusFilter = 'PAID' | 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | '';

const OrdersPage = () => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, selectedShopId } = useAuth(); // <-- Get selectedShopId
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(''); // <-- THE FIX IS HERE (default to '')
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = useCallback(async () => {
    // Determine which shop's data to fetch
    const shopIdToFetch = user?.role === 'OWNER' ? selectedShopId : user?.shopId;
    
    if (!shopIdToFetch) {
        setOrders([]);
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      // If filter is '', don't send the param, so backend returns the default (pending)
      const params = statusFilter ? { status: statusFilter } : {}; 
      const response = await api.get(`/orders/shop/${shopIdToFetch}`, { params });
      setOrders(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to fetch orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, selectedShopId, statusFilter, showNotification]); // <-- Add selectedShopId as a dependency

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleFilterChange = (event: MouseEvent<HTMLElement>, newFilter: StatusFilter) => {
      // It's possible to deselect a toggle, which results in a null value
      // We will default to empty string to keep the type consistent
    setStatusFilter(newFilter === null ? '' : newFilter);
  };
  
  const handleActionClick = (event: MouseEvent<HTMLElement>, order: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    if (status === 'CANCELLED' && !window.confirm('Are you sure you want to cancel this order?')) {
        handleActionClose();
        return;
    }
    try {
      await api.patch(`/orders/${selectedOrder.id}/status`, { status });
      showNotification('Order status updated successfully!', 'success'); // <-- SUCCESS FEEDBACK
      fetchOrders();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update status.', 'error'); // <-- ERROR FEEDBACK
    } finally {
      handleActionClose();
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 200 },
    {
      field: 'createdAt',
      headerName: 'Order Date',
      width: 180,
      valueGetter: (params) => new Date(params.value).toLocaleString(),
    },
    { field: 'customerName', headerName: 'Customer Name', width: 200 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'totalAmount', headerName: 'Total', type: 'number', width: 100, valueFormatter: (params) => formatCurrency(params.value) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={(event: MouseEvent<HTMLElement>) => handleActionClick(event, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>
      </Box>

      <Card sx={{ 
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        borderRadius: 2,
        p: 2,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Order Filters
          </Typography>
          <Button variant="contained" onClick={() => setIsFormOpen(true)}>
            Create New Order
          </Button>
        </Box>
        <Paper sx={{ p: 1, borderRadius: 2 }} elevation={0}>
          <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={handleFilterChange}
              aria-label="Order Status Filter"
              size="small"
          >
            {/* THE FIX IS HERE: value is now empty string */}
            <ToggleButton value="" aria-label="pending orders">Pending</ToggleButton>
            <ToggleButton value="SHIPPED" aria-label="shipped orders">Shipped</ToggleButton>
            <ToggleButton value="DELIVERED" aria-label="delivered orders">Delivered</ToggleButton>
            <ToggleButton value="CANCELLED" aria-label="cancelled orders">Cancelled</ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Card>
      
      <Paper sx={{ 
        height: 600, 
        width: '100%',
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
          rows={orders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          // ADD COMPONENTS AND COMPONENTSPROPS HERE
          components={{ Toolbar: ExportToolbar }}
          componentsProps={{
            toolbar: {
              data: orders,
              columns: columns,
              filename: 'orders_report',
            },
          }}
        />
      </Paper>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        {selectedOrder?.status === 'PAID' && (
          <MenuItem onClick={() => handleUpdateStatus('SHIPPED')}>
            <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>
            Mark as Shipped
          </MenuItem>
        )}
        {selectedOrder?.status === 'SHIPPED' && (
          <MenuItem onClick={() => handleUpdateStatus('DELIVERED')}>
            <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
            Mark as Delivered
          </MenuItem>
        )}
        {(selectedOrder?.status === 'PENDING' || selectedOrder?.status === 'PAID') && (
            <MenuItem onClick={() => handleUpdateStatus('CANCELLED')}>
                <ListItemIcon><CancelIcon fontSize="small" /></ListItemIcon>
                Cancel Order
            </MenuItem>
        )}
      </Menu>

      <OrderFormModal 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => {
            setIsFormOpen(false);
            setStatusFilter(''); // Go to pending view to see the new order
            fetchOrders();
        }} 
      />
    </Layout>
  );
};

export default OrdersPage;