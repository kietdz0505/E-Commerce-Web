import React from 'react';
import '../styles/categoryList.css';

function CategoryList({ categories, selectedCategoryId, onCategoryClick }) {
  return (
    <>
      <div className="az-catlist-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            className={`az-cat-card ${selectedCategoryId === cat.id ? 'selected' : ''}`}
            onClick={() => onCategoryClick(cat.id)}
            onKeyPress={(e) => { if (e.key === 'Enter') onCategoryClick(cat.id); }}
          >
            {selectedCategoryId === cat.id && (
              <span className="az-cat-tick">✓</span>
            )}
            <span className="az-cat-icon">{cat.icon}</span>
            <div className="az-cat-name">{cat.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default CategoryList;