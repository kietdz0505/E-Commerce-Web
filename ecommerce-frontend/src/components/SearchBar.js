import React, { useState } from 'react';
import PaginationConfig from '../config/paginationConfig';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(null);

  const priceRanges = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: null },
  ];

  const handleSearchClick = () => {
    const selectedRange = selectedPriceRangeIndex !== null ? priceRanges[selectedPriceRangeIndex] : null;
    const filters = {
      keyword: query.trim() || '',
      minPrice: selectedRange ? selectedRange.min : null,
      maxPrice: selectedRange ? selectedRange.max : null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    };

    onSearch(filters);
  };

  const handlePriceRangeClick = (index) => {
    const newIndex = selectedPriceRangeIndex === index ? null : index;
    setSelectedPriceRangeIndex(newIndex);

    const selectedRange = newIndex !== null ? priceRanges[newIndex] : null;
    const filters = {
      keyword: query.trim() || '',
      minPrice: selectedRange ? selectedRange.min : null,
      maxPrice: selectedRange ? selectedRange.max : null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    };

    onSearch(filters);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedPriceRangeIndex(null);
    onSearch({
      keyword: '',
      minPrice: null,
      maxPrice: null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  return (
    <div className="container d-flex justify-content-center mt-4">
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
          <button className="btn btn-primary" onClick={handleSearchClick}>
            <i className="bi bi-search"></i>
          </button>
          <button className="btn btn-outline-secondary" onClick={resetFilters}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {priceRanges.map((range, index) => (
            <button
              key={index}
              className={`btn btn-sm ${selectedPriceRangeIndex === index ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => handlePriceRangeClick(index)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
