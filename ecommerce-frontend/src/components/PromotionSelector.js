// components/PromotionSelector.js
import React from 'react';

const PromotionSelector = ({ promotions, selectedCode, onSelect }) => {
    return (
        <div className="mb-3">
            <label className="form-label">Mã khuyến mãi</label>
            <div className="d-flex flex-wrap gap-2">
                {promotions.map(promo => (
                    <button
                        key={promo.id}
                        type="button"
                        className={`btn btn-sm ${selectedCode === promo.code ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => onSelect(promo)}
                    >
                        {promo.code} - {promo.discountPercent}%
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromotionSelector;
