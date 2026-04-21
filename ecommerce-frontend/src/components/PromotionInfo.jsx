// PromotionInfo.js
import React from 'react';

const PromotionInfo = ({ promotion }) => {
  if (!promotion) return null;
  return (
    <div className="alert alert-info mt-3">
      <h6 className="fw-bold mb-2">Thông tin khuyến mãi: {promotion.code}</h6>
      <p className="mb-1">{promotion.description}</p>
      <p className="mb-1">Giảm giá: <strong>{promotion.discountPercent}%</strong></p>
      <p className="mb-1">Hiệu lực: {new Date(promotion.validFrom).toLocaleDateString()} - {new Date(promotion.validTo).toLocaleDateString()}</p>
      <p className="mb-0">Số lượt sử dụng còn lại: {promotion.usageLimit}</p>
    </div>
  );
};

export default PromotionInfo;