// src/services/admin/adminCategoryService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const adminCategoryService = {
  // Lấy danh sách category (có phân trang)
  getCategories: (page, size) =>
    apiClient.get(API_CONFIG.API.ADMIN_CATEGORIES.GET_CATEGORIES(page, size))
      .then(res => res.data),

  // Lấy chi tiết category theo ID
  getCategoryById: (id) =>
    apiClient.get(API_CONFIG.API.ADMIN_CATEGORIES.GET_CATEGORY_BY_ID(id))
      .then(res => res.data),

  // Tạo mới category
  createCategory: (categoryData) =>
    apiClient.post(API_CONFIG.API.ADMIN_CATEGORIES.CREATE_CATEGORY, categoryData)
      .then(res => res.data),

  // Cập nhật category
  updateCategory: (id, categoryData) =>
    apiClient.put(API_CONFIG.API.ADMIN_CATEGORIES.UPDATE_CATEGORY(id), categoryData)
      .then(res => res.data),

  // Xóa category
  deleteCategory: (id) =>
    apiClient.delete(API_CONFIG.API.ADMIN_CATEGORIES.DELETE_CATEGORY(id))
      .then(res => res.status === 204),
};

export default adminCategoryService;
