import React from 'react';

const OrderSummary = ({ originalTotal, discountedTotal }) => {
  return (
    <div>
      <hr />
      <h5 className="fw-bold">
        Tổng giá gốc: <span className="text-decoration-line-through me-2">{originalTotal.toLocaleString('vi-VN')}₫</span>
      </h5>
      <h5 className="fw-bold">
        Tổng sau khuyến mãi: <span className="text-danger">{discountedTotal.toLocaleString('vi-VN')}₫</span>
      </h5>
    </div>
  );
};

export default OrderSummary;