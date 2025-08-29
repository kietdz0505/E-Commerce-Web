import React, { useState } from 'react';
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { getOAuthUrl, getApiUrl } from '../config/apiConfig';

function LoginPopup({ open, onClose, onSwitchToRegister }) {

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // <-- Add loading state

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // 1. Login
            const res = await fetch(getOAuthUrl('local'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');

            const data = await res.json();
            const token = data.token;
            if (!token) throw new Error('Không tìm thấy token!');

            localStorage.setItem('token', token);

            // 2. Lấy profile ngay lập tức
            const profileRes = await fetch(getApiUrl('PROFILE'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!profileRes.ok) throw new Error('Không lấy được thông tin user!');

            const user = await profileRes.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Login thành công:', user);

            // 3. Chuyển hướng dựa trên role
            const hasAdminRole = Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');
            if (hasAdminRole) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!open) return null;

    return (
        <div className="modal show fade" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content rounded-4 shadow">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title w-100 text-center fw-bold">Đăng nhập</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body pt-2">
                        <form className="d-flex flex-column gap-3 mb-3" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-control rounded-pill px-4"
                                placeholder="Tên đăng nhập"
                                required
                                disabled={isSubmitting}
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-control rounded-pill px-4"
                                placeholder="Mật khẩu"
                                required
                                disabled={isSubmitting}
                            />
                            {error && <div className="text-danger text-center small">{error}</div>}
                            <button
                                type="submit"
                                className="btn btn-primary rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </form>

                        <div className="text-center mb-3">
                            <small className="text-secondary">Chưa có tài khoản? </small>
                            <button type="button" className="btn btn-link text-primary p-0 ms-1 fw-bold" style={{ textDecoration: 'none' }} onClick={onSwitchToRegister}>
                                Đăng ký ngay
                            </button>
                        </div>
                        <div className="text-center my-2 text-secondary">Hoặc đăng nhập bằng</div>
                        <div className="d-flex gap-3 justify-content-center">
                            <a href={getOAuthUrl('google')} className="btn btn-outline-danger rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none">
                                <FaGoogle className="fs-5" /> Google
                            </a>
                            <a href={getOAuthUrl('facebook')} className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none">
                                <FaFacebookF className="fs-5" /> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPopup;
