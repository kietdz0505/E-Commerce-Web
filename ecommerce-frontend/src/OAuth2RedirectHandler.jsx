import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from './config/apiConfig';

function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      axios.get(getApiUrl('profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        navigate('/');
      })
      .catch(() => {
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });

    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (loading) {
    return <div>Đang đăng nhập...</div>;
  }

  return null;
}

export default OAuth2RedirectHandler;
