// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002', // Your backend URL
});

export default api;