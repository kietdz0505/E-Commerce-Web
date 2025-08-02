import React from 'react';

function CategoryList({ categories, selectedCategoryId, onCategoryClick }) {
  return (
    <div className="row justify-content-center g-3">
      {categories.map((cat) => (
        <div key={cat.id} className="col-6 col-sm-4 col-md-3">
          <div
            role="button"
            tabIndex={0}
            className={`card text-center shadow-sm h-100 py-3 border-0 rounded-4 category-hover ${selectedCategoryId === cat.id ? 'border-primary border-2' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => onCategoryClick(cat.id)}
            onKeyPress={(e) => { if (e.key === 'Enter') onCategoryClick(cat.id); }}
          >
            <div className="fs-1 mb-2">{cat.icon}</div>
            <div className="fw-semibold fs-5">{cat.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryList;
