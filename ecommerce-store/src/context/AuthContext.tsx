// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

// Define types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  shopId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set default authorization header for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await api.get('/profile');
          setUser(response.data);
        } catch (error) {
          // If token is invalid, remove it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set default authorization header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user profile
      const profileResponse = await api.get('/profile');
      setUser(profileResponse.data);
      
      return Promise.resolve();
    } catch (error) {
      // Remove token if login fails
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return Promise.reject(error);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove default authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Redirect to home page
    router.push('/');
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      // Register the user
      await api.post('/auth/register', { firstName, lastName, email, password });
      
      // Automatically log in after registration
      await login(email, password);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};