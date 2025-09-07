// src/pages/TransfersPage.tsx
import React, { useState, useCallback, useEffect, MouseEvent } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box, Typography, Paper, Tabs, Tab, Menu, MenuItem, IconButton, Card
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR

const TransfersPage = () => {
  const { user, selectedShopId } = useAuth(); // <-- Get selectedShopId
  const { showNotification } = useNotification(); // <-- Use the hook
  const [tabIndex, setTabIndex] = useState(0);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for action menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);

  const fetchTransfers = useCallback(async () => {
    // Determine which shop's data to fetch
    const shopIdToFetch = user?.role === 'OWNER' ? selectedShopId : user?.shopId;
    
    if (!shopIdToFetch) return;
    setLoading(true);
    try {
      const response = await api.get(`/transfers/shop/${shopIdToFetch}`);
      setIncoming(response.data.incoming);
      setOutgoing(response.data.outgoing);
    } catch (error) {
      console.error("Failed to fetch transfers", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedShopId]); // <-- Add selectedShopId as a dependency

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleActionClick = (event: MouseEvent<HTMLElement>, transfer: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransfer(transfer);
  };
  const handleActionClose = () => setAnchorEl(null);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTransfer) return;
    try {
      await api.patch(`/transfers/${selectedTransfer.id}/status`, { status });
      showNotification(`Transfer status updated to ${status}.`, 'success'); // <-- SUCCESS FEEDBACK
      fetchTransfers();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Replaced the old alert() call
      showNotification('Action failed. The transfer may not be in the correct state.', 'error'); // <-- ERROR FEEDBACK
    } finally {
      handleActionClose();
    }
  };

  const columns = (type: 'incoming' | 'outgoing'): GridColDef[] => [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'productName', headerName: 'Product', width: 200, valueGetter: (p) => p.row.product.name },
    { field: 'quantity', headerName: 'Qty', width: 80 },
    {
        field: 'otherShop',
        headerName: type === 'incoming' ? 'From Shop' : 'To Shop',
        width: 200,
        valueGetter: (p) => (type === 'incoming' ? p.row.fromShop.name : p.row.toShop.name),
    },
    {
      field: 'actions', headerName: 'Actions', width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton onClick={(e) => handleActionClick(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Stock Transfers</Typography>
      </Box>
      <Card sx={{ 
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        borderRadius: 2
      }}>
        <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Incoming Requests" />
          <Tab label="Outgoing Requests" />
        </Tabs>
        <Box p={2}>
            {tabIndex === 0 && 
              <Paper sx={{ 
                height: 500, 
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
                  rows={incoming} 
                  columns={columns('incoming')} 
                  loading={loading} 
                  getRowId={(row) => row.id}
                  // ADD COMPONENTS AND COMPONENTSPROPS HERE
                  components={{ Toolbar: ExportToolbar }}
                  componentsProps={{
                    toolbar: {
                      data: incoming,
                      columns: columns('incoming'),
                      filename: 'incoming_transfers_report',
                    },
                  }}
                />
              </Paper>
            }
            {tabIndex === 1 && 
              <Paper sx={{ 
                height: 500, 
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
                  rows={outgoing} 
                  columns={columns('outgoing')} 
                  loading={loading} 
                  getRowId={(row) => row.id}
                  // ADD COMPONENTS AND COMPONENTSPROPS HERE
                  components={{ Toolbar: ExportToolbar }}
                  componentsProps={{
                    toolbar: {
                      data: outgoing,
                      columns: columns('outgoing'),
                      filename: 'outgoing_transfers_report',
                    },
                  }}
                />
              </Paper>
            }
        </Box>
      </Card>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        {/* Actions for Incoming Tab */}
        {tabIndex === 0 && selectedTransfer?.status === 'REQUESTED' && [
            <MenuItem key="approve" onClick={() => handleUpdateStatus('APPROVED')}>Approve</MenuItem>,
            <MenuItem key="reject" onClick={() => handleUpdateStatus('REJECTED')}>Reject</MenuItem>
        ]}
        {tabIndex === 0 && selectedTransfer?.status === 'APPROVED' &&
            <MenuItem onClick={() => handleUpdateStatus('SHIPPED')}>Mark as Shipped</MenuItem>
        }

        {/* Actions for Outgoing Tab */}
        {tabIndex === 1 && selectedTransfer?.status === 'REQUESTED' &&
            <MenuItem onClick={() => handleUpdateStatus('CANCELLED')}>Cancel Request</MenuItem>
        }
        {tabIndex === 1 && selectedTransfer?.status === 'SHIPPED' &&
            <MenuItem onClick={() => handleUpdateStatus('RECEIVED')}>Mark as Received</MenuItem>
        }
      </Menu>
    </Layout>
  );
};

export default TransfersPage;