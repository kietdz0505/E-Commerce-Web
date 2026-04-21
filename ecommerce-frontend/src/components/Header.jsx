import "bootstrap/dist/css/bootstrap.min.css";
import { FiUser, FiLogOut, FiShoppingCart, FiPackage, FiTag } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../shared/CartContext";
import '../styles/header.css';

function Header({ onLoginClick, currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, clearCartContext } = useCart();

  const handleOrdersClick = () => navigate("/my-orders");
  const handleLogout = () => {
    localStorage.removeItem("token");
    clearCartContext();
    navigate("/");
    window.location.reload();
  };
  const handleProfileClick = () => navigate("/profile");
  const handlePromotionsClick = () => navigate("/promotions/my");

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      <nav className={`navbar navbar-expand-lg az-navbar ${isAdminPath ? "admin-mode" : ""}`}>
        <div className="container az-container">
          <Link className="navbar-brand az-brand" to="/">
            AZStore<span className="brand-dot" />
          </Link>

          <button
            className="navbar-toggler az-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }} />
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            {!isAdminPath && (
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                {[
                  { label: "Trang chủ", to: "/" },
                  { label: "Sản phẩm", to: "/" },
                  { label: "Giới thiệu", to: "/" },
                  { label: "Liên hệ", to: "/" },
                ].map(({ label, to }) => (
                  <li className="nav-item" key={label}>
                    <Link
                      className={`nav-link az-nav-link ${location.pathname === to && label === "Trang chủ" ? "active-link" : ""}`}
                      to={to}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="d-flex align-items-center gap-2 ms-auto">
              {currentUser ? (
                <>
                  <div className="dropdown">
                    <button
                      className="az-user-btn dropdown-toggle"
                      id="userDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <img
                        src={currentUser.picture}
                        alt="Avatar"
                        className="az-user-avatar"
                        referrerPolicy="no-referrer"
                      />
                      <span>{currentUser.name}</span>
                    </button>
                    <ul className="dropdown-menu az-dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <button className="az-dropdown-item" onClick={handleProfileClick}>
                          <FiUser size={15} /> Thông tin cá nhân
                        </button>
                      </li>
                      <li>
                        <button className="az-dropdown-item" onClick={handleOrdersClick}>
                          <FiPackage size={15} /> Đơn hàng của tôi
                        </button>
                      </li>
                      <li>
                        <button className="az-dropdown-item" onClick={handlePromotionsClick}>
                          <FiTag size={15} /> Khuyến mãi của tôi
                        </button>
                      </li>
                      <li><hr className="dropdown-divider az-divider" /></li>
                      <li>
                        <button className="az-dropdown-item logout" onClick={handleLogout}>
                          <FiLogOut size={15} /> Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>

                  {!isAdminPath && (
                    <button className="az-cart-btn" onClick={() => navigate("/cart")}>
                      <FiShoppingCart size={17} />
                      {cartCount > 0 && <span className="az-cart-badge">{cartCount}</span>}
                    </button>
                  )}
                </>
              ) : (
                !isAdminPath && (
                  <>
                    <button className="az-login-btn" onClick={onLoginClick}>
                      Đăng nhập
                    </button>
                    <button className="az-cart-btn" onClick={() => navigate("/cart")}>
                      <FiShoppingCart size={17} />
                      {cartCount > 0 && <span className="az-cart-badge">{cartCount}</span>}
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;