import { API_CONFIG } from '../config/apiConfig';
import apiClient from '../api/axiosInstance';


export const getPromotionsByProducts = async (productIds) => {
  try {
    const response = await apiClient.get(API_CONFIG.API.PROMOTIONS_BY_PRODUCTS(productIds));
    console.log('API Raw Response:', response); // ADD THIS to see actual API response
    return response.data;  // <== Ensure this line exists
  } catch (error) {
    console.error('Failed to fetch promotions', error);
    return [];
  }
};

export const getMyPromotions = async (page = 0, size) => {
  const response = await apiClient.get(API_CONFIG.API.GET_MY_PROMOTIONS, {
    params: size ? { page, size } : { page }
  });
  return response.data;
};


