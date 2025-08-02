import React from 'react';

const priceRanges = [
  { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: null },
];

const PriceFilter = ({ selectedPriceRange, onPriceRangeChange }) => {
  return (
    <div className="my-3">
      <h5 className="fw-bold">Lọc theo giá</h5>
      <div className="d-flex flex-wrap gap-2">
        {priceRanges.map((range, index) => (
          <button
            key={index}
            className={`btn btn-sm ${selectedPriceRange === index ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPriceRangeChange(index === selectedPriceRange ? null : index)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceFilter;
