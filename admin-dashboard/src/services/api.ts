// src/services/api.ts
import axios from 'axios';

// Create a new axios instance
const api = axios.create({
  baseURL: 'http://localhost:3002', // Your backend URL
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;