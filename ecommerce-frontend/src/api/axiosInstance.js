import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";
import { toast } from "react-toastify"; 

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000 
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
          toastId: "session-expired", 
          autoClose: 3000,
        });

  
        setTimeout(() => {
          isToastShowing = false; 
        }, 3000);
      }
    }
    
    return Promise.reject(err);
  }
);

export default apiClient;