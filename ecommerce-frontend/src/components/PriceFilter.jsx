import React from 'react';
import '../styles/priceFilter.css';


const priceRanges = [
  { label: 'Dưới 5 triệu',  min: 0,        max: 5000000  },
  { label: '5 – 10 triệu',  min: 5000000,  max: 10000000 },
  { label: '10 – 20 triệu', min: 10000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: null      },
];

const PriceFilter = ({ selectedPriceRange, onPriceRangeChange }) => {
  return (
    <>
      <div className="az-pricefilter">
        <span className="az-pricefilter-label">Lọc theo giá</span>
        <div className="d-flex flex-wrap gap-2">
          {priceRanges.map((range, index) => (
            <button
              key={index}
              className={`az-price-chip ${selectedPriceRange === index ? 'active' : ''}`}
              onClick={() => onPriceRangeChange(index === selectedPriceRange ? null : index)}
            >
              {selectedPriceRange === index && (
                <i className="bi bi-check2 az-price-chip-check" />
              )}
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default PriceFilter;