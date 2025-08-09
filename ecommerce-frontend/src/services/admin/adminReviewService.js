// src/services/admin/adminReviewService.js
import axios from 'axios';
import { API_CONFIG } from '../../config/apiConfig';

const AdminReviewService = {
  deleteReview: async (productId, reviewId) => {
    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}${API_CONFIG.API.ADMIN_REVIEWS.DELETE_REVIEW(productId, reviewId)}`
    );
    return response.data;
  },
};

export default AdminReviewService;
