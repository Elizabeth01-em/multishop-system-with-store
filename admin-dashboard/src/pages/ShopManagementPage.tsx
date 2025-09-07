// src/pages/ShopManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import ExportToolbar from '../components/ExportToolbar'; // <-- 1. IMPORT THE TOOLBAR

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
};

const ShopManagementPage = () => {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentShop, setCurrentShop] = useState<any>(null);

    const fetchShops = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/shops');
            setShops(response.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showNotification('Failed to fetch shops', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);
    
    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentShop({ name: '', location: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (shop: any) => {
        setIsEditing(true);
        setCurrentShop(shop);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this shop? This cannot be undone.')) {
            try {
                await api.delete(`/shops/${id}`);
                showNotification('Shop deleted successfully', 'success');
                fetchShops();
            } catch (err: any) {
                showNotification(err.response?.data?.message || 'Failed to delete shop', 'error');
            }
        }
    };
    
    const handleSave = async () => {
        try {
            if (isEditing) {
                await api.patch(`/shops/${currentShop.id}`, { name: currentShop.name, location: currentShop.location });
                showNotification('Shop updated successfully', 'success');
            } else {
                await api.post('/shops', { name: currentShop.name, location: currentShop.location });
                showNotification('Shop created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchShops();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to save shop', 'error');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Shop ID', width: 250 }, // Added ID field for better reporting
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'location', headerName: 'Location', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(params.row)}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        Edit
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(params.id as string)}
                        size="small"
                        variant="outlined"
                        color="error"
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Layout>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Shop Management</Typography>
                <Button variant="contained" onClick={handleOpenCreate}>
                    Create Shop
                </Button>
            </Box>
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
                  rows={shops} 
                  columns={columns} 
                  loading={loading} 
                  getRowId={(row) => row.id}
                  // ===========================================
                  //      2. ADD COMPONENTS AND COMPONENTSPROPS HERE
                  // ===========================================
                  components={{ Toolbar: ExportToolbar }}
                  componentsProps={{
                    toolbar: {
                      data: shops,
                      columns: columns,
                      filename: 'shops_report',
                    },
                  }}
                />
            </Paper>
            
            {/* Shop Form Modal */}
            {isModalOpen && (
                <Card sx={modalStyle} component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <CardContent sx={{ 
                        p: 3,
                        pb: 2,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6">{isEditing ? 'Edit Shop' : 'Create Shop'}</Typography>
                        <IconButton onClick={() => setIsModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </CardContent>
                    <Divider />
                    <CardContent sx={{ 
                        p: 3,
                        pt: 2,
                        overflowY: 'auto',
                        flexGrow: 1
                    }}>
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label="Shop Name"
                            value={currentShop?.name || ''}
                            onChange={(e) => setCurrentShop({...currentShop, name: e.target.value})}
                        />
                        <TextField 
                            margin="normal" 
                            fullWidth 
                            label="Location"
                            value={currentShop?.location || ''}
                            onChange={(e) => setCurrentShop({...currentShop, location: e.target.value})}
                        />
                    </CardContent>
                    <Divider />
                    <CardContent sx={{ 
                        p: 3,
                        pt: 2
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" sx={{ ml: 2 }}>Save</Button>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Layout>
    );
};

export default ShopManagementPage;