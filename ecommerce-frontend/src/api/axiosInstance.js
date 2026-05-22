import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Attach token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Kiểm tra chặt chẽ: Chỉ đính kèm nếu token tồn tại và không phải chuỗi chữ "null"/"undefined"
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Nếu không có token hợp lệ, chủ động xóa header cũ để tránh gửi chuỗi rác sang backend
    delete config.headers.Authorization;
  }

  return config;
});

// Refresh token interceptor
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      // Nếu không có refreshToken hợp lệ, dọn sạch bộ nhớ và đá về trang chủ
      if (!refreshToken || refreshToken === "null" || refreshToken === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
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