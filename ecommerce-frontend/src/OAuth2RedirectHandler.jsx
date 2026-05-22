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

          // HIỂN THỊ THÔNG BÁO ĐỂ BẠN THẤY RÕ KẾT QUẢ
          alert("Đăng nhập thành công! Email của bạn: " + user.email);

          // Điều hướng sang /admin nếu là admin, ngược lại sang trang nào đó rõ ràng hơn (hoặc tạm để nguyên để test)
          navigate(isAdmin ? "/admin" : "/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("OAuth login process failed:", err);
        alert("Đăng nhập thất bại rồi: " + err.message);
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