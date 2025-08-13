import { API_CONFIG } from '../../config/apiConfig';
import apiClient from '../../api/axiosInstance';

const AdminUserPromotion = {

    sendPromotionForAllUsers: async (promotionId) => {
        try {
            const response = await apiClient.post(
                API_CONFIG.API.ADMIN_SEND_PROMOTION.SEND_ALL(promotionId)
            );
            return response.data;
        } catch (error) {
            console.error('Error sending promotion to all users:', error);
            throw error;
        }
    },

    sendPromotionByEmail: async (promotionId, email) => {
        try {
            const response = await apiClient.post(
                API_CONFIG.API.ADMIN_SEND_PROMOTION.SEND_BY_EMAIL(promotionId, email)
            );
            return response.data;
        } catch (error) {
            console.error(`Error sending promotion to ${email}:`, error);
            throw error;
        }
    }
};

export default AdminUserPromotion;
