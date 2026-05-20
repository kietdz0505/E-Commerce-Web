import React from 'react';
import { FaShoppingCart } from "react-icons/fa";
import '../styles/heroBanner.css';

function HeroBanner({ currentUser, onBuyNowClick }) {
  return (
    <>
      <section className="az-hero">
        {/* Background decorations */}
        <div className="az-hero-blob az-hero-blob-1" />
        <div className="az-hero-blob az-hero-blob-2" />
        <div className="az-hero-blob az-hero-blob-3" />
        <div className="az-hero-grid" />

        {/* Floating chips */}
        <div className="az-hero-chip az-hero-chip-1">⚡ Flash Sale</div>
        <div className="az-hero-chip az-hero-chip-2">🔥 Top Deals</div>
        <div className="az-hero-chip az-hero-chip-3">✨ Mới nhất</div>

        <div className="container">
          <div className="az-hero-content text-center">

            {/* Badge */}
            <div className="az-hero-badge">
              <span className="az-hero-badge-dot" />
              Siêu thị điện tử số 1 Việt Nam
            </div>

            {/* Heading */}
            <h1 className="az-hero-heading">
              {currentUser ? (
                <>
                  Chào mừng trở lại,{" "}
                  <span className="highlight">{currentUser.name}</span>
                  <br />
                  <span style={{ fontSize: "0.62em", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "-1px" }}>
                    đến với AZStore
                  </span>
                </>
              ) : (
                <>
                  Mua sắm thông minh
                  <br />
                  tại <span className="highlight">AZStore</span>
                </>
              )}
            </h1>

            {/* Sub */}
            <p className="az-hero-sub">
              Giá tốt mỗi ngày · Giao hàng nhanh · Hàng chính hãng
            </p>

            {/* CTA */}
            <button className="az-hero-cta" onClick={onBuyNowClick}>
              <span className="az-hero-cta-icon">
                <FaShoppingCart />
              </span>
              Mua ngay
            </button>

            {/* Stats */}
            <div className="az-hero-stats">
              <div className="az-hero-stat">
                <div className="az-hero-stat-num">10<span>k+</span></div>
                <div className="az-hero-stat-label">Sản phẩm</div>
              </div>
              <div className="az-hero-stat-sep" />
              <div className="az-hero-stat">
                <div className="az-hero-stat-num">50<span>k+</span></div>
                <div className="az-hero-stat-label">Khách hàng</div>
              </div>
              <div className="az-hero-stat-sep" />
              <div className="az-hero-stat">
                <div className="az-hero-stat-num">4.9<span>★</span></div>
                <div className="az-hero-stat-label">Đánh giá</div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default HeroBanner;