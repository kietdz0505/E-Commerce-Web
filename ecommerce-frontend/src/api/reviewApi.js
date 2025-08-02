import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

export const fetchProductReviews = (productId) => {
  return axios.get(getApiUrl('PRODUCT_REVIEWS', productId));
};

export const submitReview = (productId, formData) => {
  const token = localStorage.getItem('token');  // Lấy token từ localStorage (JWT)
  return axios.post(getApiUrl('PRODUCT_REVIEWS', productId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`  // Gửi Bearer Token
    }
  });
};
