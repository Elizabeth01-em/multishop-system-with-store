// src/components/ErrorDisplay.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import NextLink from 'next/link';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again later.',
  onRetry
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        py: 8,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        {message}
      </Typography>
      {onRetry ? (
        <Button variant="contained" onClick={onRetry} sx={{ mr: 2 }}>
          Try Again
        </Button>
      ) : null}
      <Button 
        variant="outlined" 
        component={NextLink} 
        href="/"
      >
        Go to Homepage
      </Button>
    </Box>
  );
};