import React from "react";
import { FaFacebook, FaInstagram, FaFacebookMessenger } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import '../styles/footer.css';

function Footer() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  if (isAdminPath) {
    return (
      <>
        <footer className="az-footer az-footer-admin mt-auto">
          <div className="container text-center">
            © {new Date().getFullYear()} AZStore Admin Panel
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <footer className="az-footer az-footer-user mt-auto">
        <div className="az-footer-orb az-footer-orb-left" />
        <div className="az-footer-orb az-footer-orb-right" />

        <div className="container text-center position-relative">
          <div className="az-footer-logo">AZStore</div>
          <div className="az-footer-tagline">Siêu thị điện tử · Giá tốt mỗi ngày</div>

          <div className="az-social-row">
            <a href="#" className="az-social-link az-social-fb" title="Facebook">
              <FaFacebook />
            </a>
            <a href="#" className="az-social-link az-social-ig" title="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="az-social-link az-social-msg" title="Messenger">
              <FaFacebookMessenger />
            </a>
          </div>

          <hr className="az-footer-divider" />

          <div className="az-footer-copy">
            © {new Date().getFullYear()} <span>AZStore</span>. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;