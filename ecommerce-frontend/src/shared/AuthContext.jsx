import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/apiConfig";

const AuthContext = createContext();

export const AuthProvider = ({
  children
}) => {

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // LOGOUT
  // =========================================

  const logout = useCallback((
    redirect = true
  ) => {

    localStorage.removeItem("token");

    setCurrentUser(null);

    if (redirect) {
      navigate("/login");
    }

  }, [navigate]);

  // =========================================
  // FETCH USER
  // =========================================

  const fetchUser = useCallback(async () => {

    const token =
      localStorage.getItem("token");

    // NO TOKEN
    if (!token) {

      setCurrentUser(null);
      setLoading(false);

      return;
    }

    try {

      const res = await fetch(
        getApiUrl("PROFILE"),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // TOKEN INVALID / EXPIRED
      if (
        res.status === 401
      ) {

        logout(false);

        return;
      }

      if (!res.ok) {

        throw new Error(
          "Failed to fetch profile"
        );
      }

      const data =
        await res.json();

      setCurrentUser(data);

    } catch (err) {

      console.error(
        "Fetch user error:",
        err
      );

      // NETWORK ERROR
      // KHÔNG logout user
      // vì có thể backend tạm thời down

    } finally {

      setLoading(false);
    }

  }, [logout]);

  // =========================================
  // INIT
  // =========================================

  useEffect(() => {

    fetchUser();

  }, [fetchUser]);

  // =========================================
  // LOGIN
  // =========================================

  const login = async (
    token
  ) => {

    localStorage.setItem(
      "token",
      token
    );

    await fetchUser();
  };

  // =========================================
  // CONTEXT
  // =========================================

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

export const useAuth = () =>
  useContext(AuthContext);