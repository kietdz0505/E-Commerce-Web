import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./shared/AuthContext";
import apiClient from "./api/axiosInstance";

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
        // 1. Lưu token vào Context/LocalStorage theo luồng của bạn
        login(token);

        // 2. ÉP TRUYỀN THẲNG TOKEN VÀO ĐÂY: Bẻ gãy bẫy bất đồng bộ của localStorage
        const res = await apiClient.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const user = res.data;
        const roles = user.roles || [];
        const isAdmin = roles.includes("ROLE_ADMIN");

        // 3. Chuyển hướng an toàn
        navigate(isAdmin ? "/admin" : "/", { replace: true });

      } catch (err) {
        console.error("OAuth error:", err);
        navigate("/", { replace: true });
      }
    };

    handleOAuth();
  }, [navigate, login]);

  return (
    <div style={{ textAlign: "center", padding: 40, fontSize: "1.1rem", fontWeight: "500" }}>
      Đang đăng nhập hệ thống...
    </div>
  );
}

export default OAuth2RedirectHandler;