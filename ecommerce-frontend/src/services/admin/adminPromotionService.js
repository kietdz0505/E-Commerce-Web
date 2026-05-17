// src/services/admin/adminPromotionService.js
import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const AdminPromotionService = {
  createPromotion: async (promotionData) => {
    const response = await apiClient.post(API_CONFIG.API.ADMIN_PROMOTIONS.CREATE_PROMOTION, promotionData);
    return response.data;
  },

  getPromotions: async (page = 0, size = 10) => {
    const response = await apiClient.get(API_CONFIG.API.ADMIN_PROMOTIONS.GET_PROMOTIONS, {
      params: { page, size }
    });
    return response.data;
  },

  updatePromotion: async (promotionId, promotionData) => {
    const response = await apiClient.put(API_CONFIG.API.ADMIN_PROMOTIONS.UPDATE_PROMOTION(promotionId), promotionData);
    return response.data;
  },

  deletePromotion: async (promotionId) => {
    const response = await apiClient.delete(API_CONFIG.API.ADMIN_PROMOTIONS.DELETE_PROMOTION(promotionId));
    return response.data;
  }
};

export default AdminPromotionService;
