// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid, Typography, TextField, Button, Box, CircularProgress, Divider, Card, CardContent
} from '@mui/material';
import Layout from '../components/Layout';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const ProfilePage = () => {
  const { showNotification } = useNotification();

  // State for profile form
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State for password form
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfileData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification('Failed to load profile data.', 'error');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [showNotification]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.patch('/profile', profileData);
      showNotification('Profile updated successfully!', 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await api.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showNotification('Password changed successfully!', 'success');
      // Clear form on success
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  if(initialLoading) {
      return <Layout><CircularProgress /></Layout>;
  }

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>My Profile</Typography>
      </Box>
      <Grid container spacing={3}>
        {/* Profile Details Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Your Details</Typography>
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField
                  name="firstName"
                  label="First Name"
                  fullWidth
                  margin="normal"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={profileLoading}>
                  {profileLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Change Password Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
                <Divider sx={{ my: 1 }} />
                <TextField
                  name="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                <TextField
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={passwordLoading}>
                  {passwordLoading ? <CircularProgress size={24} /> : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ProfilePage;