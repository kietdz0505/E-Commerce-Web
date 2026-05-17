import { createContext, useContext, useEffect, useState } from "react";
import { getApiUrl } from "../config/apiConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== FETCH USER =====
  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl("PROFILE"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error("Auth error:", err);
      localStorage.removeItem("token");
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== INIT =====
  useEffect(() => {
    fetchUser();
  }, []);

  // ===== LOGIN (FIX CHÍNH) =====
  const login = async (token) => {
    localStorage.setItem("token", token);
    await fetchUser(); 
  };

  // ===== LOGOUT =====
  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
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