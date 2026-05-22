import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./shared/AuthContext";

function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;
    executed.current = true;

    const handleOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const user = await login(token);

        if (user) {
          const roles = user.roles || [];
          const isAdmin = roles.includes("ROLE_ADMIN");

          navigate(isAdmin ? "/admin" : "/", { replace: true });

        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("OAuth login process failed:", err);
        alert("Đăng nhập thất bại rồi: " + (err.response?.data?.message || err.message));
        navigate("/", { replace: true });
      }
    };

    handleOAuth();
  }, [navigate, login]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "80vh",
      fontSize: "1.2rem", 
      fontWeight: "500",
      color: "#4b5563"
    }}>
      <div style={{ textAlign: "center" }}>
        <p>Đang xử lý đăng nhập hệ thống...</p>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: 8 }}>Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;