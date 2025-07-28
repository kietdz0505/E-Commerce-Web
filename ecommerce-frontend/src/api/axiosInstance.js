// src/api/axiosInstance.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const axiosInstance = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/api`,
    withCredentials: true,
});

export default axiosInstance;
