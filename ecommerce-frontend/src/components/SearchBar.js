import React, { useState } from 'react';
import PaginationConfig from '../config/paginationConfig'; // Import PaginationConfig

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [brandId, setBrandId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const handleSearchClick = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      alert('Vui lòng nhập từ khóa tìm kiếm.');
      return;
    }

    const filters = {
      name: trimmedQuery,
      brandId: brandId.trim() || null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minRating: minRating ? parseFloat(minRating) : null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE, // Sử dụng từ cấu hình
    };

    console.log('Filters sent:', filters); // Debug filters

    // Validation
    if (filters.minPrice && isNaN(filters.minPrice)) {
      alert('Giá tối thiểu phải là số hợp lệ.');
      return;
    }
    if (filters.maxPrice && isNaN(filters.maxPrice)) {
      alert('Giá tối đa phải là số hợp lệ.');
      return;
    }
    if (filters.minRating && (isNaN(filters.minRating) || filters.minRating < 0 || filters.minRating > 5)) {
      alert('Đánh giá phải là số từ 0 đến 5.');
      return;
    }
    if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
      alert('Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }

    onSearch(filters);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const resetFilters = () => {
    setQuery('');
    setBrandId('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
  };

  return (
    <div className="search-bar d-flex justify-content-center">
      <div className="w-75">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm sản phẩm..."
            aria-label="Search products"
          />
        </div>
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              className="form-control"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              placeholder="Mã thương hiệu"
              aria-label="Brand ID"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Giá tối thiểu"
              aria-label="Minimum price"
              min="0"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Giá tối đa"
              aria-label="Maximum price"
              min="0"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              placeholder="Đánh giá tối thiểu (0-5)"
              aria-label="Minimum rating"
              min="0"
              max="5"
              step="0.1"
            />
          </div>
        </div>
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={handleSearchClick}>
            Tìm kiếm
          </button>
          <button className="btn btn-secondary" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;