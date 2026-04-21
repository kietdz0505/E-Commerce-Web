// src/services/admin/adminBrandService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const adminBrandService = {
  getAllBrands: (page, size) =>
    apiClient.get(API_CONFIG.API.ADMIN_BRANDS.GET_ALL_BRANDS(page, size))
      .then(res => res.data),

  getBrandById: (id) =>
    apiClient.get(API_CONFIG.API.ADMIN_BRANDS.GET_BRAND_BY_ID(id))
      .then(res => res.data),

  createBrand: (brandData) =>
    apiClient.post(API_CONFIG.API.ADMIN_BRANDS.CREATE_BRAND, brandData)
      .then(res => res.data),

  updateBrand: (id, brandData) =>
    apiClient.put(API_CONFIG.API.ADMIN_BRANDS.UPDATE_BRAND(id), brandData)
      .then(res => res.data),

  deleteBrand: (id) =>
    apiClient.delete(API_CONFIG.API.ADMIN_BRANDS.DELETE_BRAND(id))
      .then(res => res.data),
};

export default adminBrandService;
