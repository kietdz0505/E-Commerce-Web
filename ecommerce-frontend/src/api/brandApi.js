import apiClient from "../api/axiosInstance";
import { getApiUrl } from '../config/apiConfig';

export const getBrandsByCategory = (categoryId) => {
  return apiClient.get(getApiUrl('BRANDS_BY_CATEGORY', categoryId));
};