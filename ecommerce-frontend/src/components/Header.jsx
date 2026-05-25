import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiUser,
  FiLogOut,
  FiShoppingCart,
  FiPackage,
  FiTag
} from "react-icons/fi";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../shared/CartContext";
import { useAuth } from "../shared/AuthContext";
import '../styles/header.css';

function Header({ onLoginClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount, clearCartContext } = useCart();
  const { currentUser, logout, loading } = useAuth();

  const isAdminPath = location.pathname.startsWith("/admin");

  if (loading) return null;

  // ===== SCROLL HANDLER =====
  const handleScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    clearCartContext();
    navigate("/");
  };

  return (
    <nav className={`navbar navbar-expand-lg az-navbar ${isAdminPath ? "admin-mode" : ""}`}>
      <div className="container az-container-fluid d-flex align-items-center justify-content-between flex-nowrap">

        {/* LOGO bên trái góc màn hình */}
        <Link className="navbar-brand az-brand mb-0" to="/">
          AZStore<span className="brand-dot" />
        </Link>

        {/* Khối chức năng cố định góc bên phải màn hình */}
        <div className="d-flex align-items-center gap-3 order-lg-last az-right-menu">
          {currentUser ? (
            <>
              <div className="dropdown az-user-dropdown">
                <button
                  className="az-user-btn dropdown-toggle"
                  data-bs-toggle="dropdown"
                  type="button"
                >
                  <img
                    src={currentUser?.picture || "https://placehold.co/60x60?text=No+Image"}
                    className="az-user-avatar"
                    alt="avatar"
                  />
                  <div className="az-user-info d-none d-sm-block">
                    <span className="az-user-name">{currentUser?.name}</span>
                  </div>
                </button>

                <ul className="dropdown-menu dropdown-menu-end az-dropdown-menu">
                  <li>
                    <button className="az-dropdown-item" onClick={() => navigate('/profile')}>
                      <FiUser size={16} /> <span>Thông tin</span>
                    </button>
                  </li>
                  <li>
                    <button className="az-dropdown-item" onClick={() => navigate('/my-orders')}>
                      <FiPackage size={16} /> <span>Đơn hàng</span>
                    </button>
                  </li>
                  <li>
                    <button className="az-dropdown-item" onClick={() => navigate('/promotions/my')}>
                      <FiTag size={16} /> <span>Khuyến mãi</span>
                    </button>
                  </li>
                  <div className="az-dropdown-divider"></div>
                  <li>
                    <button className="az-dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut size={16} /> <span>Đăng xuất</span>
                    </button>
                  </li>
                </ul>
              </div>

              {!isAdminPath && (
                <button className="az-cart-btn" onClick={() => navigate("/cart")}>
                  <FiShoppingCart size={17} />
                  {cartCount > 0 && (
                    <span className="az-cart-badge">{cartCount}</span>
                  )}
                </button>
              )}
            </>
          ) : (
            !isAdminPath && (
              <>
                <button className="az-login-btn px-3" onClick={onLoginClick}>
                  Đăng nhập
                </button>

                <button className="az-cart-btn" onClick={() => navigate("/cart")}>
                  <FiShoppingCart size={17} />
                </button>
              </>
            )
          )}

          {/* Nút 3 sọc */}
          <button
            className="navbar-toggler az-toggler border-0 ms-1 p-1"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#azNavbarContent"
            aria-controls="azNavbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{ width: '1.2rem', height: '1.2rem' }}></span>
          </button>
        </div>

        {/* Vùng Menu ẩn */}
        <div className="collapse navbar-collapse" id="azNavbarContent">
          {!isAdminPath && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 pt-3 pt-lg-0">
              <li className="nav-item">
                <Link className="nav-link az-nav-link text-start" to="/">
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link az-nav-link btn btn-link text-start w-100"
                  onClick={() => handleScroll("products-section")}
                >
                  Sản phẩm
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link az-nav-link btn btn-link text-start w-100"
                  onClick={() => handleScroll("about-section")}
                >
                  Giới thiệu
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link az-nav-link btn btn-link text-start w-100"
                  onClick={() => handleScroll("contact-section")}
                >
                  Liên hệ
                </button>
              </li>
            </ul>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Header;