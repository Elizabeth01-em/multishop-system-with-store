// src/pages/ProductCatalogPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper, Card } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // <-- Import icon for reactivate button
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { ProductFormModal } from '../components/ProductFormModal';
import { BarcodeModal } from '../components/BarcodeModal';
import ExportToolbar from '../components/ExportToolbar';
import { formatCurrency } from '../utils/currency';

const ProductCatalogPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    // --- 2. ADD STATE AND HANDLER FOR THE BARCODE MODAL ---
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showNotification('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: any) => {
        setIsEditing(true);
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleOpenBarcode = (product: any) => {
        setCurrentProduct(product); // We can reuse the currentProduct state
        setIsBarcodeModalOpen(true);
    };

    const handleDiscontinue = async (id: string) => {
        if (window.confirm('Are you sure you want to discontinue this product? It will be hidden from new orders.')) {
            try {
                await api.delete(`/products/${id}`);
                showNotification('Product discontinued successfully', 'success');
                fetchProducts();
            } catch (err: any) {
                showNotification(err.response?.data?.message || 'Failed to discontinue product', 'error');
            }
        }
    };

    // Add handler for reactivating a single product
    const handleReactivate = async (id: string) => {
        try {
            await api.patch(`/products/${id}/reactivate`);
            showNotification('Product reactivated successfully', 'success');
            fetchProducts();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to reactivate product', 'error');
        }
    };

    // Add handler for reactivating all products
    const handleReactivateAll = async () => {
        if (window.confirm('Are you sure you want to reactivate all discontinued products?')) {
            try {
                const response = await api.patch('/products/reactivate-all');
                showNotification(response.data.message, 'success');
                fetchProducts();
            } catch (err: any) {
                showNotification(err.response?.data?.message || 'Failed to reactivate products', 'error');
            }
        }
    };

    const columns: any = [
        { field: 'id', headerName: 'Product ID', width: 250 }, // Added ID field for better reporting
        { field: 'name', headerName: 'Product Name', flex: 1.5 },
        { field: 'uniqueProductCode', headerName: 'Code', flex: 1 },
        { field: 'price', headerName: 'Price', type: 'number', width: 100, valueFormatter: (params: any) => formatCurrency(params.value) },
        { 
            field: 'isActive', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params: any) => (params.value ? 'Active' : 'Discontinued')
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150, // Increase width slightly to fit more icons
            getActions: (params: any) => [
                <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleOpenEdit(params.row)} 
                    color="inherit"
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                    placeholder=""
                    onResize={() => {}}
                    onResizeCapture={() => {}}
                />,
                
                // --- 3. ADD THE NEW ACTION ITEM HERE ---
                <GridActionsCellItem icon={<PrintIcon />} label="Print Barcode" onClick={() => handleOpenBarcode(params.row)} 
                    color="inherit"
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                    placeholder=""
                    onResize={() => {}}
                    onResizeCapture={() => {}}
                />,
                // ----------------------------------------
                
                params.row.isActive ? (
                    <GridActionsCellItem 
                        icon={<DeleteIcon />} 
                        label="Discontinue" 
                        onClick={() => handleDiscontinue(params.id as string)} 
                        disabled={!params.row.isActive} 
                        color="inherit"
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                        placeholder=""
                        onResize={() => {}}
                        onResizeCapture={() => {}}
                    />
                ) : (
                    <GridActionsCellItem 
                        icon={<CheckCircleIcon />} 
                        label="Reactivate" 
                        onClick={() => handleReactivate(params.id as string)} 
                        color="inherit"
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                        placeholder=""
                        onResize={() => {}}
                        onResizeCapture={() => {}}
                    />
                )
            ],
        },
    ];

    return (
        <Layout>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Product Catalog</Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={handleReactivateAll}
                        sx={{ mr: 2 }}
                    >
                        Reactivate All Products
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleOpenCreate}>
                        Create Product
                    </Button>
                </Box>
            </Box>
            <Card sx={{ 
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
                <Paper sx={{ 
                  height: '70vh', 
                  width: '100%',
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'grey.100',
                  },
                  '& .MuiDataGrid-row:nth-of-type(odd)': {
                    backgroundColor: 'grey.50',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}>
                    <DataGrid 
                        rows={products} 
                        columns={columns} 
                        loading={loading}
                        getRowId={(row) => row.id}
                        // ADD COMPONENTS AND COMPONENTSPROPS HERE
                        components={{ Toolbar: ExportToolbar }}
                        componentsProps={{
                          toolbar: {
                            data: products,
                            columns: columns,
                            filename: 'products_report',
                          },
                        }}
                    />
                </Paper>
            </Card>

            <ProductFormModal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchProducts();
                    setIsModalOpen(false);
                }}
                isEditing={isEditing}
                product={currentProduct}
            />

            <BarcodeModal
                open={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                product={currentProduct}
            />
        </Layout>
    );
};

export default ProductCatalogPage;