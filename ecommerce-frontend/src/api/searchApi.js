import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const searchProducts = (params) => {
  return axios.get(`${API_CONFIG.BASE_URL}/api/products/search`, { params });
};

export const autocompleteProducts = (query) => {
  return axios.get(`${API_CONFIG.BASE_URL}/api/products/autocomplete`, { params: { query } });
};
