import React from 'react';
import '../styles/brandList.css';

function BrandList({ brands, selectedBrandId, onBrandClick }) {
  if (brands.length === 0) return null;

  return (
    <>
      <div className="az-brandlist-wrap">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className={`az-brand-card ${selectedBrandId === brand.id ? 'selected' : ''}`}
            onClick={() => onBrandClick(brand.id)}
          >
            <img src={brand.logoUrl} alt={brand.name} />
          </div>
        ))}
      </div>
    </>
  );
}

export default BrandList;