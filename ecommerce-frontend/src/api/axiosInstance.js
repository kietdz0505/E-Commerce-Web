import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// refresh logic safe
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return Promise.reject(err);
      }

      try {
        const res = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newToken = res.data?.data?.accessToken;

        if (!newToken) throw new Error("No token");

        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient;