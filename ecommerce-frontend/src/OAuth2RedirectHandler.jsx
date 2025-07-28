import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl} from './config/apiConfig'; 
function OAuth2RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', token);

      // Gọi API lấy thông tin user từ backend
      axios.get(getApiUrl('profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const userData = response.data;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        navigate('/'); // Chuyển về trang chủ sau khi login
      })
      .catch(() => {
        navigate('/login');
      });

    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}

export default OAuth2RedirectHandler;
