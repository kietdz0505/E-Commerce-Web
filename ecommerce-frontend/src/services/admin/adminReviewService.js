// src/services/admin/adminReviewService.js
import apiClient from '../../api/axiosInstance';
import { API_CONFIG } from '../../config/apiConfig';

const AdminReviewService = {
  deleteReview: async (productId, reviewId) => {
    const response = await apiClient.delete(
      API_CONFIG.API.ADMIN_REVIEWS.DELETE_REVIEW(productId, reviewId)
    );
    return response.data;
  },

  getAllReviews: async (productId, page, size) => {
    const response = await apiClient.get(
      API_CONFIG.API.ADMIN_REVIEWS.GET_ALL_REVIEWS(productId, page, size)
    );
    return response.data;
  },

};

export default AdminReviewService;
