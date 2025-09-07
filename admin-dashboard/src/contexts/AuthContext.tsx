// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

// Helper function to decode JWT payload
// NOTE: This is for reading data only, not for verification. Verification happens on the backend.
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};

interface AuthContextType {
  token: string | null;
  user: any | null; // You can define a stricter type for the user object later
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectedShopId: string | null; // <-- Add this
  setSelectedShopId: (shopId: string) => void; // <-- And this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [user, setUser] = useState<any | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(localStorage.getItem('selectedShopId')); // <-- Add this state

  useEffect(() => {
    // When the token changes, parse it to get user info.
    // This also runs on initial load to restore the session from localStorage.
    if (token) {
      const decodedUser = parseJwt(token);
      setUser(decodedUser);
      // Set the token for all future api requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleSetSelectedShop = (shopId: string) => {
    localStorage.setItem('selectedShopId', shopId);
    setSelectedShopId(shopId);
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('authToken', access_token);
    setToken(access_token);
    
    // Parse the token to get user information
    const decodedUser = parseJwt(access_token);
    setUser(decodedUser);
    
    // If the user is an employee, automatically select their shop
    if (decodedUser?.role === 'EMPLOYEE') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const shopResponse = await api.get(`/shops/${decodedUser.shopId}`);
      localStorage.setItem('selectedShopId', decodedUser.shopId);
      setSelectedShopId(decodedUser.shopId);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedShopId');
    setToken(null);
    setSelectedShopId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        selectedShopId,
        setSelectedShopId: handleSetSelectedShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};