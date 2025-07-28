import React, { useState } from "react";  // <-- Thêm useState ở đây
import "bootstrap/dist/css/bootstrap.min.css";
import { FiUser, FiLogOut } from 'react-icons/fi';

function Header({ onLoginClick, currentUser }) {
 
  return (
    <>
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
            <div className="d-flex align-items-center gap-3">
              {currentUser ? (
                <>
                  <div className="dropdown">
                    <button className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <img src={currentUser.picture} alt="Avatar" className="rounded-circle" width="32" height="32" />
                      <span>{currentUser.name}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                         
                        >
                          <FiUser /> Thông tin cá nhân
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a
                          className="dropdown-item d-flex align-items-center gap-2"
                          href="#"
                          onClick={() => {
                            localStorage.removeItem('token');
                            window.location.reload();
                          }}
                        >
                          <FiLogOut /> Đăng xuất
                        </a>
                      </li>
                    </ul>
                  </div>
                  <button className="btn btn-warning fw-bold">Giỏ hàng</button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline-light" onClick={onLoginClick}>Đăng nhập</button>
                  <button className="btn btn-warning fw-bold">Giỏ hàng</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
