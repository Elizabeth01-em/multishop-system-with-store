// src/components/BarcodeScannerModal.tsx
import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  Typography, 
  Button,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

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

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

export const BarcodeScannerModal = ({ open, onClose, onScanSuccess }: BarcodeScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!open) return;

    const startScanner = async () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }

      codeReaderRef.current = new BrowserMultiFormatReader();
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          console.error('No video input devices found');
          return;
        }

        const selectedDeviceId = videoDevices[0].deviceId;
        
        if (videoRef.current) {
          await codeReaderRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                onScanSuccess(result.getText());
                onClose();
              }
              
              if (err && !(err instanceof NotFoundException)) {
                console.error('Scan error:', err);
              }
            }
          );
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
      }
    };

    startScanner();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [open, onClose, onScanSuccess]);

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
          <Typography variant="h6" align="center">Scan Barcode</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </CardContent>
        <Divider />
        <CardContent sx={{ 
          p: 3,
          pt: 2,
          overflowY: 'auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <video 
            ref={videoRef} 
            style={{ 
              width: '100%', 
              height: '400px', 
              borderRadius: '4px',
              objectFit: 'cover'
            }} 
          />
        </CardContent>
        <Divider />
        <CardContent sx={{ 
          p: 3,
          pt: 2
        }}>
          <Button onClick={onClose} fullWidth variant="outlined">Cancel</Button>
        </CardContent>
      </Card>
    </Modal>
  );
};