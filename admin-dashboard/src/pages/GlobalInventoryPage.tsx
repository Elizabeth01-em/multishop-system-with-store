// src/pages/GlobalInventoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { ExpandableProductRow } from '../components/ExpandableProductRow';
import { ThresholdEditModal } from '../components/ThresholdEditModal';

const GlobalInventoryPage = () => {
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/reports/inventory-overview');
            setInventoryData(response.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError('Failed to fetch global inventory data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (item: any) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    
    if(loading) return <Layout><Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box></Layout>
    if(error) return <Layout><Alert severity='error'>{error}</Alert></Layout>

    return (
        <Layout>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>Global Inventory Overview</Typography>
            </Box>
            <Card sx={{ 
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell /> {/* For expand icon */}
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Product Code</TableCell>
                                    <TableCell align="right">Total Company Stock</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inventoryData.map((product) => (
                                    <ExpandableProductRow key={product.productId} product={product} onEditThreshold={handleOpenModal} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <ThresholdEditModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                onSuccess={() => {
                    fetchData(); // Refresh all data on success
                }}
            />
        </Layout>
    );
};

export default GlobalInventoryPage;