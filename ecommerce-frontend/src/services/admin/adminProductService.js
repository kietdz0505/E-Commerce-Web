import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const BASE_URL = API_CONFIG.BASE_URL;

export const adminProductService = {

  getAllProducts: async (page = 0, size = 10) => {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}${API_CONFIG.API.ADMIN_PRODUCTS.GET_ALL_PRODUCTS(page, size)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createProduct: async (productData) => {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}${API_CONFIG.API.ADMIN_PRODUCTS.CREATE_PRODUCT}`;
    const response = await axios.post(url, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}${API_CONFIG.API.ADMIN_PRODUCTS.UPDATE_PRODUCT(id)}`;
    const response = await axios.put(url, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}${API_CONFIG.API.ADMIN_PRODUCTS.DELETE_PRODUCT(id)}`;
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
