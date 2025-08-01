import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

export const getBrandsByCategory = (categoryId) => {
  return axios.get(getApiUrl('BRANDS_BY_CATEGORY', categoryId));
};
