import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChangePasswordModal from '../../pages/user/ChangePasswordModal';
import '../../styles/userProfile.css';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineIdentification
} from "react-icons/hi2";

function UserProfile({ currentUser }) {
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Thông tin người dùng";
    return () => (document.title = previousTitle);
  }, []);

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const roleLabels = {
    ROLE_ADMIN: 'Quản trị viên',
    ROLE_CUSTOMER: 'Khách hàng'
  };

  return (
    <Container className="az-profile-container">
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="az-profile-card">

            {/* ===== HEADER ===== */}
            <div className="az-profile-header">
              <div className="az-avatar-wrapper">
                <img
                  src={currentUser.picture}
                  alt="Avatar"
                  className="az-avatar"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h3>{currentUser.name}</h3>
              <p>{currentUser.email}</p>
            </div>

            {/* ===== INFO ===== */}
            <div className="az-profile-body">

              <h5 className="az-section-title">
                <HiOutlineUser /> Thông tin cá nhân
              </h5>

              <div className="az-info-row">
                <HiOutlineEnvelope />
                <span>Email:</span>
                <strong>{currentUser.email}</strong>
              </div>

              <div className="az-info-row">
                <HiOutlinePhone />
                <span>SĐT:</span>
                <strong>{currentUser.phone || 'Chưa cập nhật'}</strong>
              </div>

              <div className="az-info-row">
                <HiOutlineMapPin />
                <span>Địa chỉ:</span>
                <strong>{currentUser.address || 'Chưa cập nhật'}</strong>
              </div>

              <div className="az-info-row">
                <HiOutlineCalendar />
                <span>Ngày sinh:</span>
                <strong>
                  {currentUser.dob
                    ? new Date(currentUser.dob).toLocaleDateString()
                    : 'Chưa cập nhật'}
                </strong>
              </div>

              <div className="az-info-row">
                <HiOutlineIdentification />
                <span>Vai trò:</span>
                <strong>
                  {currentUser.roles
                    ? currentUser.roles.map(r => roleLabels[r] || r).join(', ')
                    : 'Người dùng'}
                </strong>
              </div>

            </div>

            {/* ===== ACTION ===== */}
            <div className="az-profile-actions">
              <Button
                className="az-btn-primary"
                onClick={() => navigate('/profile/edit')}
              >
                Sửa thông tin
              </Button>

              {currentUser.authProvider === 'LOCAL' && (
                <Button
                  className="az-btn-warning"
                  onClick={() => setShowChangePassword(true)}
                >
                  Đổi mật khẩu
                </Button>
              )}
            </div>

            <ChangePasswordModal
              show={showChangePassword}
              onClose={() => setShowChangePassword(false)}
            />

          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;