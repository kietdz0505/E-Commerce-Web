// src/api/searchApi.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const searchProducts = (filters) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Clean params: bỏ undefined/null
  const cleanedParams = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanedParams[key] = value;
    }
  });

  return axios.get(`${API_CONFIG.BASE_URL}/api/products/search`, {
    headers,
    params: cleanedParams
  });
};
