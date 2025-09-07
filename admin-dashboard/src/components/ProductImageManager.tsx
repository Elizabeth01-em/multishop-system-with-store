/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/ProductImageManager.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Grid, IconButton, Paper, Button, CircularProgress, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

interface ProductImage {
  id: string;
  productId: string;
  mimetype: string;
  displayOrder: number;
}

interface Product {
  id: string;
  images?: ProductImage[];
  // ... other product properties
}

interface ProductImageManagerProps {
  product: Product;
  onUploadSuccess: () => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({ product, onUploadSuccess }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();

  const onDrop = useCallback((acceptedFiles: any[]) => {
    // Add previews to accepted files
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] }
  });
  
  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // 'files' must match the backend interceptor
    });
    
    try {
        await api.post(`/products/${product.id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        showNotification(`${files.length} image(s) uploaded successfully!`, 'success');
        setFiles([]); // Clear the upload queue
        onUploadSuccess(); // Trigger parent component to refetch data
    } catch (error) {
        showNotification('Failed to upload images.', 'error');
    } finally {
        setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
      if(window.confirm('Are you sure you want to delete this image?')) {
          try {
              await api.delete(`/products/images/${imageId}`);
              showNotification('Image deleted successfully.', 'success');
              onUploadSuccess(); // Refresh
          } catch (error) {
              showNotification('Failed to delete image.', 'error');
          }
      }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Existing Images</Typography>
      <Grid container spacing={2}>
        {product.images?.map(image => (
          <Grid item key={image.id}>
            <Paper sx={{ width: 100, height: 100, position: 'relative' }}>
              <img src={`http://localhost:3001/public/images/${image.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" />
              <IconButton onClick={() => handleDelete(image.id)} sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
        {product.images?.length === 0 && <Typography sx={{pl:2}}>No images yet.</Typography>}
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>Upload New Images</Typography>
      <Box {...getRootProps()} sx={{ p: 4, border: '2px dashed', borderColor: isDragActive ? 'primary.main' : 'grey.400', textAlign: 'center', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500' }} />
        <Typography>Drag 'n' drop some files here, or click to select files</Typography>
      </Box>

      {files.length > 0 && (
        <Box>
            <Typography sx={{mt:2}}>Previews:</Typography>
            <Grid container spacing={2}>
                {files.map((file: any) => (
                    <Grid item key={file.name}>
                        <img src={file.preview} style={{ width: 100, height: 100, objectFit: 'cover' }} alt="Preview" />
                    </Grid>
                ))}
            </Grid>
            <Button variant="contained" onClick={handleUpload} disabled={uploading} sx={{mt: 2}}>
                {uploading ? <CircularProgress size={24}/> : `Upload ${files.length} Image(s)`}
            </Button>
        </Box>
      )}
    </Box>
  );
};