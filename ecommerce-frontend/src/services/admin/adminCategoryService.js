import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const adminCategoryService = {
  // Lấy danh sách category (có phân trang)
  getCategories: async (page, size) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_CATEGORIES.GET_CATEGORIES(page, size)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Lấy chi tiết category theo ID
  getCategoryById: async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_CATEGORIES.GET_CATEGORY_BY_ID(id)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Tạo mới category
  createCategory: async (categoryData) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_CATEGORIES.CREATE_CATEGORY}`;
    const response = await axios.post(url, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Cập nhật category
  updateCategory: async (id, categoryData) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_CATEGORIES.UPDATE_CATEGORY(id)}`;
    const response = await axios.put(url, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Xóa category
  deleteCategory: async (id) => {
    const token = localStorage.getItem('token');
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_CATEGORIES.DELETE_CATEGORY(id)}`;
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 204;
  }
};

export default adminCategoryService;
