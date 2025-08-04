import "bootstrap/dist/css/bootstrap.min.css";
import { FiUser, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../shared/CartContext';


function Header({ onLoginClick, currentUser }) {
  const navigate = useNavigate();
  const { cartCount, clearCartContext } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('token');  // Xóa token để logout
    clearCartContext();                // Xóa cart ở frontend context (React state)
    window.location.reload();          // Reload app để reset toàn bộ state
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">AZStore</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link active" to="/">Trang chủ</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/">Sản phẩm</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/">Giới thiệu</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/">Liên hệ</Link></li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            {currentUser ? (
              <>
                <div className="dropdown">
                  <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={currentUser.picture} alt="Avatar" className="rounded-circle" width="32" height="32" referrerpolicy="no-referrer" />
                    <span>{currentUser.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={handleProfileClick}
                      >
                        <FiUser /> Thông tin cá nhân
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <FiLogOut /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
                <button className="btn btn-warning fw-bold d-flex align-items-center position-relative" onClick={() => navigate('/cart')}>
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline-light" onClick={onLoginClick}>Đăng nhập</button>
                <button className="btn btn-warning fw-bold d-flex align-items-center position-relative" onClick={() => navigate('/cart')}>
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
