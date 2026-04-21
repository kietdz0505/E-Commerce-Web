import { useState } from 'react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { API_CONFIG } from '../config/apiConfig';
import { useNavigate } from 'react-router-dom'

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
    if (file && file.size > 10 * 1024 * 1024) { // Giới hạn 10MB
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

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
  const phoneRegex = /^0[0-9]{9}$/; // Định dạng số điện thoại Việt Nam

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
      setError('Mật khẩu phải ít nhất 8 ký tự, chứa ít nhất 1 chữ số và 1 ký tự đặc biệt.');
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
      fd.append('name', formData.name);
      fd.append('username', formData.username);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('password', formData.password);
      if (avatarFile) fd.append('picture', avatarFile);

      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json(); // Giả định backend trả về JSON
        throw new Error(data.message || 'Đăng ký thất bại.');
      }

      const data = await res.json(); // Lấy dữ liệu trả về (nếu có)
      alert(`Đăng ký thành công! ID: ${data.id || 'N/A'}. Hãy đăng nhập.`);
      setFormData({ name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' });
      setAvatarFile(null);
      setError('');
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
    <div className="modal show fade" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title w-100 text-center fw-bold">Đăng ký tài khoản</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-2">
            <form className="d-flex flex-column gap-3 mb-3" onSubmit={handleSubmit}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Họ và tên" required />
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Tên đăng nhập" required />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Email" required />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Số điện thoại" required />
              <input type="file" accept="image/*" className="form-control rounded-pill px-4" onChange={handleAvatarChange} aria-label="Ảnh đại diện" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Mật khẩu" required />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control rounded-pill px-4" placeholder="Xác nhận mật khẩu" required />

              {error && <div className="text-danger text-center small">{error}</div>}
              <button type="submit" className="btn btn-success rounded-pill fw-bold py-2" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            <div className="text-center mb-3">
              <small className="text-secondary">Đã có tài khoản? </small>
              <button type="button" className="btn btn-link text-primary p-0 ms-1 fw-bold" style={{ textDecoration: 'none' }} onClick={onSwitchToLogin}>
                Đăng nhập ngay
              </button>
            </div>

            <div className="text-center my-2 text-secondary">Hoặc đăng ký bằng</div>
            <div className="d-flex gap-3 justify-content-center">
              <a href={`${API_CONFIG.OAUTH.GOOGLE}`} className="btn btn-outline-danger rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none">
                <FaGoogle className="fs-5" /> Google
              </a>
              <a href={`${API_CONFIG.OAUTH.FACEBOOK}`} className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none">
                <FaFacebookF className="fs-5" /> Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPopup;