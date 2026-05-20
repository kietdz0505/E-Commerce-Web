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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
                return Promise.reject(error);
            }

            try {
                // Call refresh endpoint using raw axios to avoid request interceptor loops
                const res = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const data = res.data;
                const newAccessToken = data?.data?.accessToken;
                const newRefreshToken = data?.data?.refreshToken;

                if (!newAccessToken) {
                    throw new Error("Không nhận được access token mới!");
                }

                localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
