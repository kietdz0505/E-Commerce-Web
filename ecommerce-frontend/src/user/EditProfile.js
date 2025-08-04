import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';  // Import Spinner
import { getApiUrl } from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../shared/NotificationContext';

function EditProfile({ currentUser, onUpdateSuccess }) {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        gender: currentUser?.gender || '',
        dob: currentUser?.dob || '',
        picture: currentUser?.picture || ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // Bật loading

        try {
            let uploadedAvatarUrl = formData.picture;
            if (avatarFile) {
                const cloudinaryData = new FormData();
                cloudinaryData.append('file', avatarFile);
                cloudinaryData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET);
                const res = await axios.post('https://api.cloudinary.com/v1_1/dfgnoyf71/image/upload', cloudinaryData);
                uploadedAvatarUrl = res.data.secure_url;
            }

            const token = localStorage.getItem('token');
            await axios.put(getApiUrl('EDIT_PROFILE'), { ...formData, picture: uploadedAvatarUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showNotification('Đã cập nhật thông tin cá nhân!', 'success');
            onUpdateSuccess();
        } catch (error) {
            console.error('Update failed:', error);
            showNotification('Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.', 'danger');
        } finally {
            setLoading(false);  // Tắt loading
        }
    };

    return (
        <Container className="mt-5 pt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow p-4">
                        <h3 className="mb-4 text-center">Chỉnh sửa thông tin cá nhân</h3>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Giới tính</Form.Label>
                                <Form.Control type="text" name="gender" value={formData.gender} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày sinh</Form.Label>
                                <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh đại diện</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleAvatarChange}
                                    disabled={currentUser.authProvider !== 'LOCAL'}
                                />
                                {currentUser.authProvider !== 'LOCAL' && (
                                    <div className="text-muted small mt-1">Không thể đổi ảnh vì bạn đăng nhập bằng {currentUser.authProvider}</div>
                                )}
                            </Form.Group>

                            <Button variant="primary" type="submit" disabled={loading} className="w-100">
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang lưu...
                                    </>
                                ) : 'Lưu thay đổi'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default EditProfile;
