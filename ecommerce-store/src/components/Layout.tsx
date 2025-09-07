// src/components/Layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box } from "@mui/material";
import dynamic from 'next/dynamic';

// Dynamically import components
const Header = dynamic(() => import('@/components/Header').then(mod => ({ default: mod.Header })), {
  ssr: true, // Changed to true for better SEO and performance
});

const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), {
  ssr: true, // Changed to true for better SEO and performance
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by ensuring consistent rendering
  if (!mounted) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh'
        }}
      >
        <Box component="header" sx={{ height: '64px' }} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Box component="footer" sx={{ height: '64px' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}