// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext'; // <-- Import the hook
import {
  Container,
  Box,
  Card,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

const LoginPage = () => {
  const { showNotification } = useNotification(); // <-- Use the hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(''); // <-- REMOVE
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(''); // <-- REMOVE
    setLoading(true);
    try {
      await login(email, password);
      showNotification('Login successful!', 'success'); // <-- SUCCESS FEEDBACK
      navigate('/');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to login. Please try again.', 'error'); // <-- ERROR FEEDBACK
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ 
          p: 4, 
          width: '100%', 
          mt: 2,
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <Typography component="h1" variant="h5" align="center">
            Sign In
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>} <-- REMOVE */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;