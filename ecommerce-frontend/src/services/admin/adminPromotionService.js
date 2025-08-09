// src/services/admin/adminPromotionService.js
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const AdminPromotionService = {
  createPromotion: async (promotionData) => {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_PROMOTIONS.CREATE_PROMOTION}`,
      promotionData
    );
    return response.data;
  },
};

export default AdminPromotionService;
