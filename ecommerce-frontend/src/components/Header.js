import "bootstrap/dist/css/bootstrap.min.css";
import { FiUser, FiLogOut, FiShoppingCart, FiPackage, FiTag } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../shared/CartContext";

function Header({ onLoginClick, currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, clearCartContext } = useCart();

  const handleOrdersClick = () => {
    navigate("/my-orders");
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    clearCartContext();
    navigate("/");
    window.location.reload();
  };
  const handleProfileClick = () => {
    navigate("/profile");
  };
  const handlePromotionsClick = () => {
    navigate("/promotions/my");
  };

  // 👉 Kiểm tra nếu đường dẫn bắt đầu bằng /admin
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top shadow ${
        isAdminPath ? "navbar-dark bg-dark" : "navbar-dark bg-primary"
      }`}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          AZStore
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          {!isAdminPath && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Sản phẩm
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Giới thiệu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Liên hệ
                </Link>
              </li>
            </ul>
          )}
          <div className="d-flex align-items-center gap-3">
            {currentUser ? (
              <>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={currentUser.picture}
                      alt="Avatar"
                      className="rounded-circle"
                      width="32"
                      height="32"
                      referrerPolicy="no-referrer"
                    />
                    <span>{currentUser.name}</span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={handleProfileClick}
                      >
                        <FiUser /> Thông tin cá nhân
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={handleOrdersClick}
                      >
                        <FiPackage /> Đơn hàng của tôi
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={handlePromotionsClick}
                      >
                        <FiTag /> Khuyến mãi của tôi
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
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
                {!isAdminPath && (
                  <button
                    className="btn btn-warning fw-bold d-flex align-items-center position-relative"
                    onClick={() => navigate("/cart")}
                  >
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}
              </>
            ) : (
              !isAdminPath && (
                <>
                  <button className="btn btn-outline-light" onClick={onLoginClick}>
                    Đăng nhập
                  </button>
                  <button
                    className="btn btn-warning fw-bold d-flex align-items-center position-relative"
                    onClick={() => navigate("/cart")}
                  >
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
