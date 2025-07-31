import React from 'react';
import { FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ prod, isHot }) => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3">
    <div className="card h-100 shadow-sm border-0 rounded-4 product-hover position-relative">
      {isHot && (
        <span className="badge bg-danger position-absolute top-0 end-0 m-2">Hot</span>
      )}
      <img
        src={prod.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
        alt={prod.name}
        className="card-img-top p-3 rounded-4 product-img-hover"
        style={{ height: 180, objectFit: "contain", background: "#f8f9fa" }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{prod.name}</h5>
        {prod.description && (
          <p className="card-text small text-secondary mb-2" style={{ minHeight: 36 }}>
            {prod.description.slice(0, 40)}
            {prod.description.length > 40 ? '...' : ''}
          </p>
        )}
        <p className="card-text text-danger fw-bold mb-2 fs-5">
          {prod.price ? prod.price.toLocaleString("vi-VN") + "₫" : "Liên hệ"}
        </p>
        <button className="btn btn-primary mt-auto w-100">
          <FaShoppingCart className="me-2 mb-1" />Mua ngay
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;
