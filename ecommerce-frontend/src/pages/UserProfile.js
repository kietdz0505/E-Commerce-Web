import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ChangePasswordModal from '../user/ChangePasswordModal';

function UserProfile({ currentUser }) {
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Thông tin người dùng"; 

    return () => {
        document.title = previousTitle; 
    };
}, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');  // Navigate về trang chủ
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Tránh hiển thị "Bạn chưa đăng nhập!" nhấp nháy
  }

  const roleLabels = {
    ROLE_ADMIN: 'Quản trị viên',
    ROLE_CUSTOMER: 'Khách hàng'
  };

  return (
    <Container className="mt-5 pt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow p-4">
            <div className="text-center mb-4">
              <img src={currentUser.picture} alt="Avatar" className="rounded-circle" width="100" height="100" referrerPolicy="no-referrer" />
              <h3 className="mt-3">{currentUser.name}</h3>
              <p className="text-muted">{currentUser.email}</p>
            </div>
            <div>
              <h5>Thông tin chi tiết:</h5>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Số điện thoại:</strong> {currentUser.phone || 'Chưa cập nhật'}</p>
              <p><strong>Địa chỉ:</strong> {currentUser.address || 'Chưa cập nhật'}</p>
              <p><strong>Ngày sinh:</strong> {currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Chưa cập nhật'}</p>
              <p><strong>Giới tính:</strong> {currentUser.gender || 'Chưa cập nhật'}</p>
              <p><strong>Vai trò:</strong> {currentUser.roles ? currentUser.roles.map(role => roleLabels[role] || role).join(', ') : 'Người dùng'}</p>
            </div>
            <div className="mt-4">
              <div className="d-flex justify-content-between">
                <Button variant="primary" onClick={() => navigate('/profile/edit')}>
                  Sửa thông tin
                </Button>
                {currentUser.authProvider === 'LOCAL' && (
                  <Button variant="warning" onClick={() => setShowChangePassword(true)}>
                    Đổi mật khẩu
                  </Button>
                )}
              </div>

              <ChangePasswordModal
                show={showChangePassword}
                onClose={() => setShowChangePassword(false)}
              />
            </div>

          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;
