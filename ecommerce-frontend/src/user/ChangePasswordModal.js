import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';

function ChangePasswordModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
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
      console.error(err);
      setError(err.response?.data || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Đổi mật khẩu</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu hiện tại</Form.Label>
            <Form.Control type="password" name="currentPassword" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control type="password" name="newPassword" onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <Form.Control type="password" name="confirmPassword" onChange={handleChange} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Đổi mật khẩu
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ChangePasswordModal;
