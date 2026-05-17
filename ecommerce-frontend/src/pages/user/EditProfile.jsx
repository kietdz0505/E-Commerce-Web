import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Form, Button, Container, Row, Col, Card, Spinner
} from 'react-bootstrap';
import { getApiUrl } from '../../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../shared/NotificationContext';
import { useAuth } from '../../shared/AuthContext';

import '../../styles/editProfile.css';

import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineCamera
} from "react-icons/hi2";

function EditProfile() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const { currentUser, fetchUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    picture: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== LOAD USER =====
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    setFormData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      address: currentUser.address || '',
      gender: currentUser.gender || '',
      dob: currentUser.dob || '',
      picture: currentUser.picture || ''
    });

    setPreview(currentUser.picture);

  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // ===== INPUT =====
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ===== AVATAR =====
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // ===== SUBMIT =====
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let uploadedAvatarUrl = formData.picture;

    if (avatarFile) {
      const data = new FormData();
      data.append('file', avatarFile);
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

      const CLOUDINARY_URL =
        `${import.meta.env.VITE_CLOUDINARY_URL}/image/upload`;

      const res = await axios.post(CLOUDINARY_URL, data);
      uploadedAvatarUrl = res.data.secure_url;
    }

    const token = localStorage.getItem('token');

    await axios.put(
      getApiUrl('EDIT_PROFILE'),
      { ...formData, picture: uploadedAvatarUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await fetchUser();

    success('Cập nhật thành công!'); // ✅ NEW

    navigate('/profile');

  } catch (err) {
    console.error(err);
    error('Lỗi khi cập nhật!'); // ✅ NEW
  } finally {
    setLoading(false);
  }
};

  return (
    <Container className="az-edit-container">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="az-edit-card">

            <h3 className="az-edit-title">Chỉnh sửa hồ sơ</h3>

            <Form onSubmit={handleSubmit}>
              <Row>

                {/* LEFT */}
                <Col md={7}>
                  <div className="az-form-group">
                    <HiOutlineUser />
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Họ tên"
                    />
                  </div>

                  <div className="az-form-group">
                    <HiOutlinePhone />
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại"
                    />
                  </div>

                  <div className="az-form-group">
                    <HiOutlineMapPin />
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Địa chỉ"
                    />
                  </div>

                  <div className="az-form-group">
                    <HiOutlineCalendar />
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>
                </Col>

                {/* RIGHT */}
                <Col md={5} className="text-center">
                  <div className="az-avatar-upload">

                    <img src={preview} alt="avatar" />

                    <label className="az-upload-btn">
                      <HiOutlineCamera />
                      <input
                        type="file"
                        hidden
                        onChange={handleAvatarChange}
                        disabled={currentUser.authProvider !== 'LOCAL'}
                      />
                    </label>

                  </div>

                  {currentUser.authProvider !== 'LOCAL' && (
                    <p className="az-note">
                      Không thể đổi ảnh ({currentUser.authProvider})
                    </p>
                  )}
                </Col>

              </Row>

              <Button
                type="submit"
                className="az-save-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Đang lưu...
                  </>
                ) : "Lưu thay đổi"}
              </Button>

            </Form>

          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditProfile;