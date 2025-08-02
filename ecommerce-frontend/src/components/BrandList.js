import React from 'react';

function BrandList({ brands, selectedBrandId, onBrandClick }) {
  if (brands.length === 0) return null;

  return (
    <div className="d-flex overflow-auto mt-3 justify-content-center py-2 gap-3">
      {brands.map((brand) => (
        <div
          key={brand.id}
          className={`d-flex flex-column align-items-center justify-content-center border rounded-3 p-2 shadow-sm ${selectedBrandId === brand.id ? 'border-primary' : ''} flex-shrink-0`}
          style={{ width: '80px', height: '40px', cursor: 'pointer' }}
          onClick={() => onBrandClick(brand.id)}
        >
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="img-fluid mb-1"
            style={{ maxHeight: '40px', objectFit: 'contain' }}
          />
        </div>
      ))}
    </div>
  );
}

export default BrandList;
