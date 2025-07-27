import React from "react";
import { FaFacebook, FaInstagram, FaFacebookMessenger } from "react-icons/fa";

function Footer() {
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