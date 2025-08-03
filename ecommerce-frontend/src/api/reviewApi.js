import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';
import PaginationConfig from '../config/paginationConfig';

export const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Submit Review (POST) - multipart/form-data
export const submitReview = (productId, formData) => {
  return axios.post(getApiUrl('PRODUCT_REVIEWS', productId), formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateReview = (productId, reviewId, formData) => {
  return axios.put(getApiUrl('PRODUCT_REVIEW_DETAIL', productId, reviewId), formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};



// Fetch Reviews (GET)
export const fetchProductReviews = (productId, page = 0, size = PaginationConfig.REVIEW_PAGE_SIZE) => {
  const url = `${getApiUrl('PRODUCT_REVIEWS', productId)}?page=${page}&size=${size}`;
  return axios.get(url, { headers: authHeaders() });
};


export const deleteReview = (productId, reviewId) => {
  return axios.delete(`${getApiUrl('PRODUCT_REVIEWS', productId)}/${reviewId}`, { headers: authHeaders() });
};;
