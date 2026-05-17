import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { getApiUrl } from '../../config/apiConfig';

import '../../styles/changePasswordModal.css';

function ChangePasswordModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(getApiUrl('CHANGE_PASSWORD'), {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Đổi mật khẩu thành công!');
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="az-modal-dialog"
      contentClassName="az-modal-content"
    >
      <Modal.Header closeButton className="az-modal-header border-0">
        <Modal.Title>Đổi mật khẩu</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="az-modal-body">

          {error && (
            <Alert variant="danger" className="az-alert">
              {error}
            </Alert>
          )}

          {/* CURRENT */}
          <div className="az-form-group">
            <FaLock />
            <input
              type={showPassword.current ? 'text' : 'password'}
              name="currentPassword"
              placeholder="Mật khẩu hiện tại"
              onChange={handleChange}
              required
            />
            <span onClick={() => togglePassword('current')}>
              {showPassword.current ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* NEW */}
          <div className="az-form-group">
            <FaLock />
            <input
              type={showPassword.new ? 'text' : 'password'}
              name="newPassword"
              placeholder="Mật khẩu mới"
              onChange={handleChange}
              required
            />
            <span onClick={() => togglePassword('new')}>
              {showPassword.new ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* CONFIRM */}
          <div className="az-form-group">
            <FaLock />
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              onChange={handleChange}
              required
            />
            <span onClick={() => togglePassword('confirm')}>
              {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {formData.confirmPassword &&
            formData.confirmPassword !== formData.newPassword && (
              <p className="az-error-text">Mật khẩu không khớp</p>
            )}

        </Modal.Body>

        <Modal.Footer className="az-modal-footer border-0">
          <Button variant="light" onClick={onClose}>
            Hủy
          </Button>

          <Button type="submit" className="az-save-btn" disabled={loading}>
            {loading && <Spinner size="sm" className="me-2" />}
            Đổi mật khẩu
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ChangePasswordModal;