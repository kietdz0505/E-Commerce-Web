import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="d-flex justify-content-center mt-4">
    <button
      className="btn btn-outline-secondary mx-1"
      disabled={currentPage === 0}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Trước
    </button>
    <span className="mx-2 align-self-center">
      Trang {currentPage + 1} / {totalPages}
    </span>
    <button
      className="btn btn-outline-secondary mx-1"
      disabled={currentPage === totalPages - 1}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Tiếp
    </button>
  </div>
);

export default Pagination;
