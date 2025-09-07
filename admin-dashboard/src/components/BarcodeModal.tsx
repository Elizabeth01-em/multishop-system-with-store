// src/components/BarcodeModal.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Modal, 
  Box, 
  Typography, 
  Button, 
  Divider, 
  ToggleButton, 
  ToggleButtonGroup, 
  CircularProgress,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80vw' },
  maxWidth: '600px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
};

// This is the component that will be printed
const PrintableLabel = React.forwardRef(({ product, codeType, imageDataUrl }: { product: any, codeType: 'barcode' | 'qrcode', imageDataUrl: string | null }, ref: any) => (
  <Box ref={ref} sx={{ textAlign: 'center', p: 2 }}>
    <Typography variant="h6">{product?.name}</Typography>
    {imageDataUrl ? (
      <img
        src={imageDataUrl}
        alt={`${codeType === 'barcode' ? 'Barcode' : 'QR Code'} for ${product?.name}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )}
    <Typography variant="body2" sx={{ mt: 1 }}>
      {codeType === 'barcode' ? 'Barcode' : 'QR Code'}: {product?.uniqueProductCode}
    </Typography>
  </Box>
));

interface BarcodeModalProps {
  open: boolean;
  onClose: () => void;
  product: any | null;
}

export const BarcodeModal = ({ open, onClose, product }: BarcodeModalProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode'>('barcode');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Load image data when product or codeType changes
  useEffect(() => {
    if (!product) return;
    
    const loadImageData = async () => {
      setLoading(true);
      try {
        // Fetch the image as a blob
        const response = await api.get(`/products/${product.id}/${codeType}`, {
          responseType: 'blob'
        });
        
        // Convert blob to data URL
        const reader = new FileReader();
        reader.onload = () => {
          setImageDataUrl(reader.result as string);
          setLoading(false);
        };
        reader.onerror = () => {
          console.error('Error reading image data');
          setImageDataUrl(null);
          setLoading(false);
        };
        reader.readAsDataURL(response.data);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageDataUrl(null);
        setLoading(false);
      }
    };
    
    loadImageData();
  }, [product, codeType]);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handleCodeTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newCodeType: 'barcode' | 'qrcode' | null,
  ) => {
    if (newCodeType !== null) {
      setCodeType(newCodeType);
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
          <Typography variant="h6" component="h2">Product Code</Typography>
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
          {/* Code type selector */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ToggleButtonGroup
              value={codeType}
              exclusive
              onChange={handleCodeTypeChange}
              aria-label="code type"
            >
              <ToggleButton value="barcode" aria-label="barcode">
                Barcode
              </ToggleButton>
              <ToggleButton value="qrcode" aria-label="qrcode">
                QR Code
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Render the printable component visibly so the user can see it, and our ref can point to it */}
          {product && <PrintableLabel ref={componentRef} product={product} codeType={codeType} imageDataUrl={imageDataUrl} />}
        </CardContent>
        <Divider />
        <CardContent sx={{ 
          p: 3,
          pt: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Close</Button>
            <Button variant="contained" sx={{ ml: 2 }} onClick={handlePrint} disabled={loading || !imageDataUrl}>
              {loading ? <CircularProgress size={24} /> : 'Print'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Modal>
  );
};