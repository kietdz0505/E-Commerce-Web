import apiClient from "../api/axiosInstance";
import { getApiUrl } from '../config/apiConfig';

export const getAllCategories = () => {
  return apiClient.get(getApiUrl('CATEGORIES'));
};