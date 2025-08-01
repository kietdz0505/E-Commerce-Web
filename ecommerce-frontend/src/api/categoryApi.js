import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

export const getAllCategories = () => {
  return axios.get(getApiUrl('CATEGORIES'));
};
