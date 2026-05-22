import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
   
    if (err.response?.status === 401) {
      console.warn("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ.");
    }
    return Promise.reject(err);
  }
);

export default apiClient;