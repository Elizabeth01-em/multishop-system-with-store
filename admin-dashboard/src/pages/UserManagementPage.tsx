// src/pages/UserManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block'; // Deactivate Icon
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import ExportToolbar from '../components/ExportToolbar'; // <-- IMPORT THE TOOLBAR

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

const UserManagementPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]); // For the dropdown
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch users and shops in parallel
            const [usersRes, shopsRes] = await Promise.all([api.get('/users'), api.get('/shops')]);
            setUsers(usersRes.data);
            setShops(shopsRes.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showNotification('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handlers for opening modals
    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentUser({ firstName: '', lastName: '', email: '', password: '', role: 'EMPLOYEE', shopId: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setIsEditing(true);
        setCurrentUser(user);
        setIsModalOpen(true);
    };
    
    const handleDeactivate = async (id: string) => {
        if (window.confirm('Are you sure you want to deactivate this user? Their access will be revoked.')) {
            try {
                await api.delete(`/users/${id}`);
                showNotification('User deactivated successfully', 'success');
                fetchData();
            } catch (err: any) {
                showNotification(err.response?.data?.message || 'Failed to deactivate user', 'error');
            }
        }
    };
    
    const handleSave = async () => {
        try {
            const { id, firstName, lastName, email, password, role, shopId } = currentUser;
            const payload = isEditing ? { role, shopId } : { firstName, lastName, email, password, role, shopId };

            if (isEditing) {
                await api.patch(`/users/${id}`, payload);
                showNotification('User updated successfully', 'success');
            } else {
                await api.post('/users', payload);
                showNotification('User created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to save user', 'error');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'User ID', width: 250 }, // Added ID field for better reporting
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.5 },
        { field: 'role', headerName: 'Role', flex: 0.5 },
        { 
            field: 'shop', 
            headerName: 'Assigned Shop', 
            flex: 1, 
            valueGetter: (params) => shops.find(s => s.id === params.row.shopId)?.name || 'N/A' 
        },
        { 
            field: 'isActive', 
            headerName: 'Status', 
            width: 100,
            renderCell: (params) => (params.value ? 'Active' : 'Inactive')
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(params.row)}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        Edit
                    </Button>
                    <Button
                        startIcon={<BlockIcon />}
                        onClick={() => handleDeactivate(params.id as string)}
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={!params.row.isActive}
                    >
                        Deactivate
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Layout>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Employee Management</Typography>
                <Button variant="contained" onClick={handleOpenCreate}>
                    Create Employee
                </Button>
            </Box>
            <Paper sx={{ 
              height: 600, 
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
                  rows={users} 
                  columns={columns} 
                  loading={loading} 
                  getRowId={(row) => row.id}
                  // ADD COMPONENTS AND COMPONENTSPROPS HERE
                  components={{ Toolbar: ExportToolbar }}
                  componentsProps={{
                    toolbar: {
                      data: users,
                      columns: columns,
                      filename: 'employees_report',
                    },
                  }}
                />
            </Paper>

            {/* User Form Modal */}
            {isModalOpen && (
                <Card sx={modalStyle} component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <CardContent sx={{ 
                        p: 3,
                        pb: 2,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6">{isEditing ? 'Edit Employee' : 'Create Employee'}</Typography>
                        <IconButton onClick={() => setIsModalOpen(false)} size="small">
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
                        {isEditing ? (
                            <>
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="First Name"
                                    value={currentUser?.firstName || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                                />
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="Last Name"
                                    value={currentUser?.lastName || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                                />
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="Email"
                                    type="email"
                                    value={currentUser?.email || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                                />
                            </>
                        ) : (
                            <>
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="First Name"
                                    value={currentUser?.firstName || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                                />
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="Last Name"
                                    value={currentUser?.lastName || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                                />
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="Email"
                                    type="email"
                                    value={currentUser?.email || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                                />
                                <TextField 
                                    margin="normal" 
                                    required 
                                    fullWidth 
                                    label="Password"
                                    type="password"
                                    value={currentUser?.password || ''}
                                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                                />
                            </>
                        )}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={currentUser?.role || ''}
                                label="Role"
                                onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                            >
                                <MenuItem value={'OWNER'}>Owner</MenuItem>
                                <MenuItem value={'EMPLOYEE'}>Employee</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Assign to Shop</InputLabel>
                            <Select
                                value={currentUser?.shopId || ''}
                                label="Assign to Shop"
                                onChange={(e) => setCurrentUser({...currentUser, shopId: e.target.value})}
                            >
                                {shops.map(shop => <MenuItem key={shop.id} value={shop.id}>{shop.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </CardContent>
                    <Divider />
                    <CardContent sx={{ 
                        p: 3,
                        pt: 2
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" sx={{ ml: 2 }}>Save</Button>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Layout>
    );
};

export default UserManagementPage;