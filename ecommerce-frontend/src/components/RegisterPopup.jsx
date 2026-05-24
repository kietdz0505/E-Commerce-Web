import { useState } from 'react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { API_CONFIG } from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/registerPopup.css';
import { getOAuthUrl } from '../config/apiConfig';
import { toast } from 'react-hot-toast';

function RegisterPopup({ open, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setError('File quá lớn, tối đa 10MB.');
      setAvatarFile(null);
      return;
    }
    if (file && !file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh.');
      setAvatarFile(null);
      return;
    }
    setAvatarFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
  const phoneRegex = /^0[0-9]{9}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Mật khẩu ≥8 ký tự, có số và ký tự đặc biệt.');
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ.');
      setIsLoading(false);
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== 'confirmPassword') fd.append(k, v);
      });
      if (avatarFile) fd.append('picture', avatarFile);

      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        body: fd,
      });

     if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Đăng ký thất bại.');
      }

      await res.json();

      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');

      setFormData({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setAvatarFile(null);
      navigate('/');
      onSwitchToLogin();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="az-modal-overlay" onClick={onClose}>
      <div className="az-modal" onClick={(e) => e.stopPropagation()}>

        <div className="az-modal-header">
          <h2>Đăng ký tài khoản</h2>
          <button onClick={onClose}>×</button>
        </div>

        <form className="az-form" onSubmit={handleSubmit}>

          <input name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" required />
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Tên đăng nhập" required />
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" required />

          <label className="az-file">
            Ảnh đại diện
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </label>

          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mật khẩu" required />
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Xác nhận mật khẩu" required />

          {error && <div className="az-error-text">{error}</div>}

          <button className="az-submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="az-switch">
          Đã có tài khoản?
          <span onClick={onSwitchToLogin}> Đăng nhập</span>
        </div>

        <div className="az-divider">Hoặc</div>

        <div className="az-social">
          <a href={getOAuthUrl("google")}>
            <FaGoogle /> Google
          </a>
          <a href={getOAuthUrl("facebook")}>
            <FaFacebookF /> Facebook
          </a>
        </div>

      </div>
    </div>
  );
}

export default RegisterPopup;