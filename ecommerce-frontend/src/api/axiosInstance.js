// src/api/axiosInstance.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const apiClient = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}`,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('Attaching token:', token);  // Debug token mỗi lần request
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default apiClient;
