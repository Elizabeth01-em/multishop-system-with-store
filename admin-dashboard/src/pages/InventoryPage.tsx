// src/pages/InventoryPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  Modal, 
  TextField, 
  Typography, 
  Alert, 
  Paper,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR

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

const InventoryPage = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  
  const fetchInventory = useCallback(async () => {
    if (!user?.shopId) {
        setError('User is not assigned to a shop.');
        setLoading(false);
        return;
    };
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/inventory/shop/${user.shopId}`);
      setInventory(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenModal = (item: any) => {
    setEditingItem(item);
    setNewQuantity(item.quantity.toString());
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setNewQuantity('');
  };

  const handleSaveQuantity = async () => {
    if (!editingItem) return;
    try {
      await api.post('/inventory/update', {
        productId: editingItem.product.id,
        quantity: parseInt(newQuantity, 10),
      });
      handleCloseModal();
      fetchInventory(); // Refresh the data
      showNotification('Quantity updated successfully', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update quantity', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 150 },
    {
      field: 'productName',
      headerName: 'Product Name',
      width: 250,
      valueGetter: (params: any) => params.row.product?.name,
    },
    {
      field: 'productCode',
      headerName: 'Product Code',
      width: 150,
      valueGetter: (params: any) => params.row.product?.uniqueProductCode,
    },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenModal(params.row)}
        >
          Edit Quantity
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Inventory
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
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
          rows={inventory}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          // ADD COMPONENTS AND COMPONENTSPROPS HERE
          components={{ Toolbar: ExportToolbar }}
          componentsProps={{
            toolbar: {
              data: inventory,
              columns: columns,
              filename: 'inventory_report',
            },
          }}
        />
      </Paper>

      {/* Edit Quantity Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
      >
        <Card sx={modalStyle}>
          <CardContent sx={{ 
            p: 3,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" component="h2">
              Edit Quantity for "{editingItem?.product?.name}"
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
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
              label="New Quantity"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              sx={{ mt: 1 }}
            />
          </CardContent>
          <Divider />
          <CardContent sx={{ 
            p: 3,
            pt: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveQuantity}
                sx={{ ml: 2 }}
              >
                Save
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Modal>
    </Layout>
  );
};

export default InventoryPage;