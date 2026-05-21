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
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token) => {
    localStorage.setItem("token", token);
    fetchUser();
  };

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