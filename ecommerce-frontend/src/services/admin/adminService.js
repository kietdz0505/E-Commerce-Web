import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get(API_CONFIG.API.ADMIN_DASHBOARD);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
      return {
        users: 0,
        categories: 0,
        brands: 0,
        orders: 0,
        products: 0,
        reviews: 0
      };
    }
  }
};

export default adminService;
