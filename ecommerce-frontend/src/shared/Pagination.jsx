import React from 'react';
import '../styles/pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="az-pagination">
    <button
      className="az-page-btn"
      disabled={currentPage === 0}
      onClick={() => onPageChange(currentPage - 1)}
    >
      ← Trước
    </button>

    <span className="az-page-info">
      Trang <b>{currentPage + 1}</b> / {totalPages}
    </span>

    <button
      className="az-page-btn"
      disabled={currentPage === totalPages - 1}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Tiếp →
    </button>
  </div>
);

export default Pagination;
