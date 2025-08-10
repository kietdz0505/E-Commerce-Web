// src/services/admin/adminProductService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const adminProductService = {
  // Lấy tất cả sản phẩm (phân trang)
  getAllProducts: (page = 0, size = 10) =>
    apiClient
      .get(API_CONFIG.API.ADMIN_PRODUCTS.GET_ALL_PRODUCTS(page, size))
      .then(res => res.data),

  // Tạo sản phẩm mới
  createProduct: (productData) =>
    apiClient
      .post(API_CONFIG.API.ADMIN_PRODUCTS.CREATE_PRODUCT, productData)
      .then(res => res.data),

  // Cập nhật sản phẩm
  updateProduct: (id, productData) =>
    apiClient
      .put(API_CONFIG.API.ADMIN_PRODUCTS.UPDATE_PRODUCT(id), productData)
      .then(res => res.data),

  // Xóa sản phẩm
  deleteProduct: (id) =>
    apiClient
      .delete(API_CONFIG.API.ADMIN_PRODUCTS.DELETE_PRODUCT(id)),
};

export default adminProductService;
