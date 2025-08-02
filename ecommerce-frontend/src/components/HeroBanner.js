import React from 'react';
import { FaShoppingCart } from "react-icons/fa";

function HeroBanner({ currentUser }) {
  return (
    <section className="py-5 text-white text-center" style={{ background: "linear-gradient(120deg, #1976d2 60%, #42a5f5 100%)", marginBottom: "2rem" }}>
      <div className="container">
        <h1 className="display-3 fw-bold mb-3 text-shadow">
          {currentUser ? <>Chào mừng <span className="text-warning fw-bolder">{currentUser.name}</span> đến với AZStore</> : 'Chào mừng đến với AZStore'}
        </h1>
        <p className="lead mb-4 fs-4">Siêu thị điện tử - Giá tốt mỗi ngày!</p>
        <button className="btn btn-warning btn-lg fw-bold shadow">
          <FaShoppingCart className="me-2 mb-1" />Mua ngay
        </button>
      </div>
    </section>
  );
}

export default HeroBanner;
