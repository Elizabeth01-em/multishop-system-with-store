/* eslint-disable react-hooks/exhaustive-deps */
// src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/context/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import NextLink from 'next/link';
import api from '@/utils/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const [activeTab, setActiveTab] = useState(0);
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load profile data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfileData({
        id: response.data.id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        zipCode: response.data.zipCode || ''
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Update all profile fields
      await api.patch('/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode
      });
      showNotification('Profile updated successfully', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showNotification('New password must be at least 8 characters long', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.post('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showNotification('Password changed successfully', 'success');
      // Clear password fields
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to change password';
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // If user is not authenticated, show a message
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please sign in to view your profile
          </Typography>
          <Button 
            variant="contained" 
            href="/login" 
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity as never}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        My Account
      </Typography>
      
      <Grid container spacing={4}>
        {/* Profile Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                backgroundColor: 'primary.main'
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600}>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {profileData.email}
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => setActiveTab(0)}>
              Edit Profile
            </Button>
          </Paper>
          
          <Paper sx={{ mt: 3 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Profile tabs"
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab label="Profile Information" {...a11yProps(0)} />
              <Tab label="Change Password" {...a11yProps(1)} />
              <Tab label="Order History" {...a11yProps(2)} />
              <Tab label="Wishlist" {...a11yProps(3)} />
              <Tab label="Address Book" {...a11yProps(4)} />
              <Tab label="Payment Methods" {...a11yProps(5)} />
            </Tabs>
          </Paper>
        </Grid>
        
        {/* Profile Content */}
        <Grid item xs={12} md={8}>
          <Paper>
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Address Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      sx={{ px: 4 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Change Password
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      sx={{ px: 4 }}
                      onClick={handleChangePassword}
                      disabled={saving}
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Order History
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  You haven&apos;t placed any orders yet
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} href="/products">
                  Start Shopping
                </Button>
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Wishlist
              </Typography>
              
              {wishlistItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    Your wishlist is empty
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} href="/products">
                    Browse Products
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {wishlistItems.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {item.image ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              height: 140, 
                              backgroundColor: '#f5f5f5', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              No image
                            </Typography>
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {item.name}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button 
                              size="small" 
                              component={NextLink} 
                              href={`/products/${item.uniqueProductCode}`}
                              variant="outlined"
                            >
                              View
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => removeFromWishlist(item.id)}
                            >
                              Remove
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
            
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Address Book
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  You haven&apos;t added any addresses yet
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Add New Address
                </Button>
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={5}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Payment Methods
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  You haven&apos;t added any payment methods yet
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Add Payment Method
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}