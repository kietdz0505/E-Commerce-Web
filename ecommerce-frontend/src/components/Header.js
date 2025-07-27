import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Header({ onLoginClick }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
      <div className="container">
        <a className="navbar-brand fw-bold fs-3" href="#">AZStore</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><a className="nav-link active" href="#">Trang chủ</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Sản phẩm</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Giới thiệu</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Liên hệ</a></li>
          </ul>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" onClick={onLoginClick}>Đăng nhập</button>
            <button className="btn btn-warning fw-bold">Giỏ hàng</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header; 