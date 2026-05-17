// src/services/admin/adminReportService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const AdminReportService = {
  getReports: async (start, end, limit) => {
    const response = await apiClient.get(API_CONFIG.API.ADMIN_STATS, {
      params: { start, end, limit }
    });
    return response.data;
  }
};

export default AdminReportService;
