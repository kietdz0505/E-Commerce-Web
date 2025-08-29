import React from "react";
import { FaFacebook, FaInstagram, FaFacebookMessenger } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  // 👉 Kiểm tra nếu đường dẫn bắt đầu bằng /admin
  const isAdminPath = location.pathname.startsWith("/admin");

  // Nếu ở trang admin thì có thể đổi màu hoặc ẩn footer
  if (isAdminPath) {
    return (
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container text-center small">
          © {new Date().getFullYear()} AZStore Admin Panel
        </div>
      </footer>
    );
  }

  // Footer mặc định cho user
  return (
    <footer className="bg-primary text-white py-4 mt-auto">
      <div className="container text-center">
        <div className="mb-2">
          <a href="#" className="text-white fs-4 me-3" title="Facebook">
            <FaFacebook />
          </a>
          <a href="#" className="text-white fs-4 me-3" title="Instagram">
            <FaInstagram />
          </a>
          <a href="#" className="text-white fs-4" title="Zalo/Messenger">
            <FaFacebookMessenger />
          </a>
        </div>
        <div className="small">
          © {new Date().getFullYear()} AZStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
