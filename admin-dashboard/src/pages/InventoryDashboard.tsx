// src/pages/InventoryDashboard.tsx
import React, { useEffect, useState, useCallback, MouseEvent } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Card
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR

// Import our new modals
import { ReceiveStockModal } from '../components/ReceiveStockModal';
import { HistoryViewerModal } from '../components/HistoryViewerModal';
import { RequestTransferModal } from '../components/RequestTransferModal'; // <-- Import

const editModalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
  p: 4,
};

const InventoryDashboard = () => {
  const { user, selectedShopId } = useAuth(); // <-- Get selectedShopId
  const { showNotification } = useNotification(); // <-- Use the hook
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for modals
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State for the item being edited/viewed
  const [editingItem, setEditingItem] = useState<any>(null);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState('');

  // State for action menus
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchInventory = useCallback(async () => {
    // Determine which shop's data to fetch
    const shopIdToFetch = user?.role === 'OWNER' ? selectedShopId : user?.shopId;
    
    if (!shopIdToFetch) return;
    setLoading(true);
    try {
      const response = await api.get(`/inventory/shop/${shopIdToFetch}`);
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedShopId]); // <-- Add selectedShopId as a dependency

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleActionClick = (event: MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Handlers for opening modals
  const handleOpenEditModal = () => {
    setEditingItem(selectedItem);
    setNewQuantity(selectedItem?.quantity?.toString() || '');
    setIsEditModalOpen(true);
    handleActionClose();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setNewQuantity('');
  };

  const handleOpenHistoryModal = () => {
    setHistoryItem(selectedItem);
    setIsHistoryModalOpen(true);
    handleActionClose();
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setHistoryItem(null);
  };

  const handleOpenTransferModal = () => { // <-- Add this handler
    setEditingItem(selectedItem);
    setIsTransferModalOpen(true);
    handleActionClose();
  };

  const handleSaveQuantity = async () => {
    if (!editingItem || !newQuantity) return;
    try {
      await api.patch(`/inventory/${editingItem.id}/quantity`, { 
        quantity: parseInt(newQuantity),
        reason: 'MANUAL_ADJUSTMENT' // You might want to prompt for a reason
      });
      showNotification('Quantity updated successfully!', 'success'); // <-- SUCCESS FEEDBACK
      handleCloseEditModal();
      fetchInventory();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update quantity.', 'error'); // <-- ERROR FEEDBACK
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'productName', 
      headerName: 'Product', 
      flex: 1,
      valueGetter: (params) => params.row.product?.name,
    },
    { 
      field: 'productCode', 
      headerName: 'Code', 
      width: 150,
      valueGetter: (params) => params.row.product?.uniqueProductCode,
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      type: 'number', 
      width: 130,
    },
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
          Inventory
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" onClick={() => setIsReceiveModalOpen(true)}>
            Receive Stock
        </Button>
      </Box>

      <Card sx={{ 
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        borderRadius: 2
      }}>
        <Paper sx={{ 
          height: 600, 
          width: '100%',
          border: 0,
          '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.100' },
          '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: 'grey.50' },
          // Now style the whole row, which is cleaner
          '& .MuiDataGrid-row.low-stock-warning': {
            backgroundColor: '#ffb3b3', // A light pastel red
            '&:hover': {
              backgroundColor: '#ff9999', // A slightly darker red on hover
            },
          },
        }}>
          <DataGrid
            rows={inventory}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            getRowClassName={(params) =>
              params.row.quantity <= params.row.lowStockThreshold ? 'low-stock-warning' : ''
            }
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
      </Card>
      
      {/* Action Menu for each row */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        <MenuItem onClick={handleOpenEditModal} disabled>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            Adjust Quantity
        </MenuItem>
        <MenuItem onClick={handleOpenHistoryModal}>
            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
            View History
        </MenuItem>
        <MenuItem onClick={handleOpenTransferModal}> {/* <-- Add this MenuItem */}
            <ListItemIcon><TransferWithinAStationIcon fontSize="small" /></ListItemIcon>
            Request Transfer
        </MenuItem>
      </Menu>

      {/* EDIT MODAL - DISABLED for now to promote using specific actions */}
      <Modal open={isEditModalOpen} onClose={handleCloseEditModal}>
        <Box sx={editModalStyle}>
          <Typography variant="h6" component="h2">Adjust Quantity for "{editingItem?.product?.name}"</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Note: Manual adjustments should be rare. Use Receive or Sale actions."
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveQuantity} sx={{ ml: 2 }}>Save</Button>
          </Box>
        </Box>
      </Modal>

      {/* Our Two New Modals */}
      <ReceiveStockModal 
        open={isReceiveModalOpen} 
        onClose={() => setIsReceiveModalOpen(false)}
        onSuccess={() => {
            setIsReceiveModalOpen(false);
            fetchInventory(); // Refresh data on success
        }}
      />
      <HistoryViewerModal
        open={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        item={historyItem}
      />
      {/* Add the new modal at the end */}
      <RequestTransferModal 
        open={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        product={editingItem?.product}
      />
    </Layout>
  );
};

export default InventoryDashboard;