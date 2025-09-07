/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/RequestTransferModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Button, 
  Divider, 
  CircularProgress,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook

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

interface RequestTransferModalProps {
  open: boolean;
  onClose: () => void;
  product: any | null; // The product to transfer
}

export const RequestTransferModal = ({ open, onClose, product }: RequestTransferModalProps) => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [shopStocks, setShopStocks] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(''); // <-- REMOVE
  // const [success, setSuccess] = useState(''); // <-- REMOVE

  useEffect(() => {
    if (open && product) {
      const fetchStockLevels = async () => {
        setLoading(true);
        // setError(''); // <-- REMOVE
        // setSuccess(''); // <-- REMOVE
        try {
          const response = await api.get(`/inventory/product/${product.id}/all-shops`);
          setShopStocks(response.data);
        } catch (err) {
          showNotification('Failed to fetch stock levels for other shops.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchStockLevels();
    }
  }, [open, product, showNotification]);
  
  const handleQuantityChange = (shopId: string, value: string) => {
    setQuantities(prev => ({ ...prev, [shopId]: value }));
  };
  
  const handleRequest = async (toShopId: string) => {
    const quantity = parseInt(quantities[toShopId] || '0', 10);
    if (quantity <= 0) {
      showNotification('Please enter a valid quantity.', 'warning');
      return;
    }
    // setError(''); // <-- REMOVE
    // setSuccess(''); // <-- REMOVE
    
    try {
      await api.post('/transfers', {
        productId: product.id,
        toShopId: toShopId,
        quantity: quantity,
      });
      showNotification(`Successfully requested ${quantity} units from shop.`, 'success'); // <-- SUCCESS FEEDBACK
      // Clear the input for that row
      handleQuantityChange(toShopId, '');
    } catch(err: any) {
        showNotification(err.response?.data?.message || 'Failed to create transfer request.', 'error'); // <-- ERROR FEEDBACK
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card sx={modalStyle}>
        <CardContent sx={{ 
          p: 3,
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography variant="h6" component="h2">Request Transfer for: {product?.name}</Typography>
          <IconButton onClick={onClose} size="small">
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
          <Typography variant="body2" color="text.secondary" gutterBottom>
            View stock levels in other shops and request a transfer.
          </Typography>
          
          {loading && <CircularProgress sx={{ my: 2 }} />}
          {/* {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>} <-- REMOVE */}
          {/* {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>} <-- REMOVE */}
          
          <List>
            {shopStocks.map(stock => (
              <React.Fragment key={stock.shopId}>
                <ListItem>
                  <ListItemText 
                    primary={stock.shop.name}
                    secondary={`Current Stock: ${stock.quantity}`}
                  />
                  <TextField 
                    label="Qty to Request"
                    type="number"
                    size="small"
                    sx={{ mx: 2, width: 150 }}
                    value={quantities[stock.shopId] || ''}
                    onChange={(e) => handleQuantityChange(stock.shopId, e.target.value)}
                  />
                  <Button 
                      variant="contained" 
                      onClick={() => handleRequest(stock.shopId)}
                      disabled={stock.quantity < parseInt(quantities[stock.shopId] || '0', 10)}
                  >
                    Request
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Modal>
  );
};