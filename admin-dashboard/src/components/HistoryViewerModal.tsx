/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/HistoryViewerModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '60vw' },
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
};

interface HistoryViewerModalProps {
  open: boolean;
  onClose: () => void;
  item: any | null; // The full inventory item from the DataGrid row
}

export const HistoryViewerModal: React.FC<HistoryViewerModalProps> = ({ open, onClose, item }) => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(''); // <-- REMOVE

  useEffect(() => {
    if (open && item) {
      const fetchHistory = async () => {
        setLoading(true);
        // setError(''); // <-- REMOVE
        try {
          const response = await api.get(
            `/inventory/logs/product/${item.product.id}/shop/${item.shopId}`
          );
          setLogs(response.data);
        } catch (err) {
          showNotification('Failed to fetch history.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [open, item, showNotification]);

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
          <Typography variant="h6" component="h2">
            Movement History for "{item?.product?.name}"
          </Typography>
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
          {/* {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>} <-- REMOVE */}

          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '60vh' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
              </Box>
            ) : (
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{`${log.user.firstName} ${log.user.lastName}`}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: log.quantityChange > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                      >
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </CardContent>
      </Card>
    </Modal>
  );
};