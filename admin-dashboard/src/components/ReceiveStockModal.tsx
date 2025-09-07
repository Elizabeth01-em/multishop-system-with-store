/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/ReceiveStockModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  IconButton,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import { BarcodeScannerModal } from './BarcodeScannerModal';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
};

interface ReceiveStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh the inventory list
}

export const ReceiveStockModal = ({ open, onClose, onSuccess }: ReceiveStockModalProps) => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // You can remove the [error, setError] state here too
  // const [error, setError] = useState(''); // <-- REMOVE

  useEffect(() => {
    // Fetch products only when the modal opens
    if (open) {
      const fetchProducts = async () => {
        try {
          const response = await api.get('/products');
          setProducts(response.data);
        } catch (err) {
          console.error('Failed to fetch products');
          showNotification('Could not load product list.', 'error');
        }
      };
      fetchProducts();
    }
  }, [open, showNotification]);

  const handleScanSuccess = async (scannedCode: string) => {
    try {
        const response = await api.get(`/products/lookup/${scannedCode}`);
        setSelectedProduct(response.data);
        showNotification(`Product found: ${response.data.name}`, 'info');
    } catch (err) {
        showNotification('Product not found for the scanned code.', 'error');
    }
  };

  const handleClose = () => {
    // Reset state on close
    setSelectedProduct(null);
    setQuantity('');
    // setError(''); // <-- REMOVE
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // ... validation logic
    if (!selectedProduct || !quantity) {
        showNotification('Please select a product and enter a quantity.', 'warning');
        return;
    }
    setLoading(true);
    // setError(''); // <-- REMOVE
    
    try {
        await api.post('/inventory/receive', {
            productId: selectedProduct.id,
            quantity: parseInt(quantity, 10),
        });
        showNotification('Stock received successfully!', 'success'); // <-- SUCCESS FEEDBACK
        onSuccess(); // Trigger refresh on parent
        handleClose();
    } catch (err: any) {
        showNotification(err.response?.data?.message || 'Failed to receive stock.', 'error'); // <-- ERROR FEEDBACK
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Card sx={modalStyle} component="form" onSubmit={handleSubmit}>
          <CardContent sx={{ 
            p: 3,
            pb: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography variant="h6" component="h2">Receive New Stock</Typography>
            <IconButton onClick={handleClose} size="small">
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
            {/* You no longer need the <Alert> component inside the form */}
            {/* {error && <Alert ...>{error}</Alert>} <-- REMOVE */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} (${option.uniqueProductCode})`}
                onChange={(_, value) => setSelectedProduct(value)}
                value={selectedProduct ? products.find(p => p.id === selectedProduct.id) || null : null}
                renderInput={(params) => <TextField {...params} label="Select Product" margin="normal" required />}
                sx={{ flexGrow: 1 }}
              />
              <IconButton onClick={() => setIsScannerOpen(true)} color="primary">
                <QrCodeScannerIcon />
              </IconButton>
            </Box>
            <TextField
              label="Quantity Received"
              type="number"
              fullWidth
              margin="normal"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </CardContent>
          <Divider />
          <CardContent sx={{ 
            p: 3,
            pt: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ ml: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Add to Inventory'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Modal>

      <BarcodeScannerModal
          open={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
      />
    </>
  );
};