import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback((redirect = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setCurrentUser(null);
    if (redirect) navigate("/");
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/api/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Fetch user failed:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // CHUẨN HÓA: Chỉ giữ lại DUY NHẤT 1 hàm login async, bọc useCallback cẩn thận
  const login = useCallback(async (token) => {
    setLoading(true);
    localStorage.setItem("token", token);
    
    try {
      // Ép gửi kèm Header trực tiếp để không bị phụ thuộc vào tốc độ nạp của localStorage
      const res = await apiClient.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(res.data);
      return res.data; 
    } catch (err) {
      localStorage.removeItem("token");
      setCurrentUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);