import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from './config/apiConfig';
import { useAuth } from './shared/AuthContext';

function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        await login(token);

        const res = await axios.get(getApiUrl('PROFILE'), {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;

        const isAdmin =
          Array.isArray(user.roles) &&
          user.roles.includes("ROLE_ADMIN");

        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }

      } catch (error) {
        console.error("OAuth error:", error);
        navigate('/login');
      }
    };

    handleOAuthLogin();
  }, [navigate, login]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h4>Đang đăng nhập...</h4>
    </div>
  );
}

export default OAuth2RedirectHandler;