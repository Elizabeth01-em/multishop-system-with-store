// src/components/ThresholdEditModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

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

interface ThresholdEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: any | null; // The sub-row item: { shopId, shopName, quantity, lowStockThreshold, inventoryId }
}

export const ThresholdEditModal = ({ open, onClose, item, onSuccess }: ThresholdEditModalProps) => {
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (item) {
      setThreshold(item.lowStockThreshold?.toString() || '10');
    }
  }, [item]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/inventory/${item.inventoryId}/threshold`, {
        lowStockThreshold: parseInt(threshold, 10),
      });
      showNotification('Threshold updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to update threshold', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card sx={modalStyle} component="form" onSubmit={(e)=>{e.preventDefault(); handleSave();}}>
        <CardContent sx={{ 
          p: 3,
          pb: 2,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography variant="h6">Set Low-Stock Threshold</Typography>
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
              For <b>{item?.productName}</b> at <b>{item?.shopName}</b>
          </Typography>
          <TextField
              margin="normal"
              required
              fullWidth
              label="Threshold Value"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
          />
        </CardContent>
        <Divider />
        <CardContent sx={{ 
          p: 3,
          pt: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ ml: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Modal>
  );
};