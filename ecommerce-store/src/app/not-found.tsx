// src/app/not-found.tsx
import { Box, Typography, Button } from '@mui/material';
import NextLink from 'next/link';

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh',
        py: 8,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom fontWeight={700} color="primary">
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or didn&apos;t exist in the first place.
      </Typography>
      <Button 
        variant="contained" 
        component={NextLink} 
        href="/"
        size="large"
      >
        Go to Homepage
      </Button>
    </Box>
  );
}