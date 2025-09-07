// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute = ({ element }: ProtectedRouteProps): JSX.Element => {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, render the requested element. Otherwise, redirect to login.
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" />;
};

export { ProtectedRoute };