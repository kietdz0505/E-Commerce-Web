import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";
import { toast } from "react-hot-toast"; 

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 0
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

let isToastShowing = false;

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ.");

      localStorage.removeItem("token");

      if (!isToastShowing) {
        isToastShowing = true;
        
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          id: "session-expired", 
          duration: 3000,
        });

        setTimeout(() => {
          isToastShowing = false; 
          window.location.href = "/";
        }, 1200);
      }
    }
    
    return Promise.reject(err);
  }
);

export default apiClient;