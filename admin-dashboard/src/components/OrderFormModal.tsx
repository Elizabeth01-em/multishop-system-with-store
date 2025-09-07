/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/OrderFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Autocomplete,
  Paper,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close'; // Import close icon
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import { BarcodeScannerModal } from './BarcodeScannerModal';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '50vw' },
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
};

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Define a type for our order items for better type safety
interface OrderItem {
  productId: string;
  quantity: number;
}

export const OrderFormModal = ({ open, onClose, onSuccess }: OrderFormModalProps) => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', quantity: 1 }]); // Use the type
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // You can now REMOVE the [error, setError] state if it's only used for API errors
  // const [error, setError] = useState(''); // <-- REMOVE

  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
          const response = await api.get('/products');
          setProducts(response.data);
        } catch (err) {
          console.error('Failed to fetch products');
        }
      };
      fetchProducts();
    }
  }, [open]);
  
  // ===================== THE FIX IS HERE =====================
  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  // ==========================================================

  const handleScanSuccess = async (scannedCode: string) => {
    try {
        const response = await api.get(`/products/lookup/${scannedCode}`);
        const newProduct = response.data;
        
        // Check if item already exists in the list to increment quantity
        const existingItemIndex = items.findIndex(item => item.productId === newProduct.id);

        if(existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity++;
            setItems(newItems);
        } else {
            setItems([...items, { productId: newProduct.id, quantity: 1 }]);
        }
        showNotification(`Added ${newProduct.name} to order.`, 'info');
    } catch (err) {
        showNotification('Product not found for the scanned code.', 'error');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setShippingAddress('');
    setItems([{ productId: '', quantity: 1 }]);
    // setError(''); // <-- REMOVE
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    // setError(''); // <-- REMOVE

    const orderData = {
      customerName,
      customerEmail,
      shippingAddress,
      items: items.filter(item => item.productId && item.quantity > 0),
    };

    // ... orderData validation
    if (orderData.items.length === 0) {
        // showNotification can replace this simple error state too
        showNotification('Please add at least one valid product.', 'warning');
        setLoading(false);
        return;
    }

    try {
      await api.post('/orders', orderData);
      showNotification('Order created successfully!', 'success'); // <-- SUCCESS FEEDBACK
      onSuccess();
      handleClose();
    } catch (err: any) {
      // Replaced the old setError call
      showNotification(err.response?.data?.message || 'Failed to create order.', 'error'); // <-- ERROR FEEDBACK
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Card sx={modalStyle} component="form" onSubmit={handleSubmit}>
          {/* MODAL HEADER */}
          <CardContent sx={{ 
            p: 3,
            pb: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography variant="h6" component="h2">Create New Order</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </CardContent>
          <Divider />
          
          {/* MODAL CONTENT */}
          <CardContent sx={{ 
            p: 3,
            pt: 2,
            overflowY: 'auto',
            flexGrow: 1
          }}>
            <TextField
              label="Customer Name"
              fullWidth
              margin="normal"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <TextField
              label="Customer Email"
              fullWidth
              margin="normal"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <TextField
              label="Shipping Address"
              fullWidth
              margin="normal"
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Order Items</Typography>

            {items.map((item, index) => (
              <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', mb: 2, borderRadius: 2 }} elevation={1}>
                <Autocomplete
                  options={products.filter(product => product.isActive !== false)} // Only show active products
                  getOptionLabel={(option) => `${option.name} (${option.uniqueProductCode})${option.isActive === false ? ' - DISCONTINUED' : ''}`}
                  onChange={(_, value) => handleItemChange(index, 'productId', value?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Select Product" />}
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                  sx={{ width: 100 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <IconButton onClick={() => handleRemoveItem(index)} color="error" disabled={items.length === 1}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Paper>
            ))}

            <Button 
              onClick={() => setIsScannerOpen(true)} 
              startIcon={<QrCodeScannerIcon />} 
              sx={{ mt: 1, ml: 1 }}
            >
              Scan Item to Add
            </Button>
            <Button onClick={handleAddItem} startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1, ml: 1 }}>Add Item</Button>
            
            {/* We no longer need a dedicated error display inside the form */}
            {/* {error && <Typography ...>{error}</Typography>} <-- REMOVE */}
          </CardContent>
          
          {/* MODAL FOOTER */}
          <Divider />
          <CardContent sx={{ 
            p: 3,
            pt: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ ml: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Create Order'}
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

export default OrderFormModal;
