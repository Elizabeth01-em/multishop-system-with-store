// src/components/ProductFormModal.tsx
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
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { ProductImageManager } from './ProductImageManager'; // <-- Import

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

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEditing: boolean;
  product: any | null;
}

export const ProductFormModal = ({ open, onClose, onSuccess, isEditing, product }: ProductFormModalProps) => {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', uniqueProductCode: '' });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        uniqueProductCode: product.uniqueProductCode || '',
      });
    } else {
      setFormData({ name: '', description: '', price: '', uniqueProductCode: '' });
    }
  }, [product]);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price), // Convert price to number
      };
      
      if (isEditing) {
        await api.patch(`/products/${product.id}`, payload);
        showNotification('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showNotification('Product created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to save product', 'error');
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
          <Typography variant="h6">{isEditing ? 'Edit Product' : 'Create New Product'}</Typography>
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
          <TextField margin="normal" required fullWidth label="Product Name" name="name" value={formData.name} onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Unique Product Code" name="uniqueProductCode" value={formData.uniqueProductCode} onChange={handleChange} disabled={isEditing} />
          <TextField margin="normal" required fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} InputProps={{ inputProps: { step: "0.01", min: "0" } }} />
          <TextField margin="normal" fullWidth label="Description" name="description" multiline rows={3} value={formData.description} onChange={handleChange} />
          
          {isEditing && product && (
            <>
              <Divider sx={{ my: 3 }} />
              <ProductImageManager product={product} onUploadSuccess={onSuccess} />
            </>
          )}
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