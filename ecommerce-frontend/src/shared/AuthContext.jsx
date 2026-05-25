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
    setCurrentUser(null);
    if (redirect) navigate("/");
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      localStorage.removeItem("token"); 
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/api/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Fetch user failed:", err);
      if (!err.response || err.response.status === 401 || err.response.status === 403) {
        localStorage.removeItem("token");
      }
      
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (token) => {
    setLoading(true);
    localStorage.setItem("token", token);

    try {
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
      setLoading(false); 
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