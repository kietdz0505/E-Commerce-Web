// src/api/brandApi.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const getAllBrands = () => {
  return axios.get(`${API_CONFIG.BASE_URL}/api/brands`);
};
