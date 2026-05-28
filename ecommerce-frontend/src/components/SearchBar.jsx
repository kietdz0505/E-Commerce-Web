import React, { useState } from 'react';
import PaginationConfig from '../config/paginationConfig';
import '../styles/searchBar.css';

const SearchBar = ({ onSearch, onResetAll }) => {
  const [query, setQuery] = useState('');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(null);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);

  const priceRanges = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 – 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 – 20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: null },
  ];

  const ratingOptions = [5, 4, 3, 2, 1];

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (selectedPriceRangeIndex !== null || minPriceInput || maxPriceInput ? 1 : 0) +
    (selectedRating !== null ? 1 : 0);

  const hasFilters = activeFilterCount > 0;

  const getActualPriceRange = () => {
    if (minPriceInput || maxPriceInput) {
      return {
        min: minPriceInput ? Number(minPriceInput) : 0,
        max: maxPriceInput ? Number(maxPriceInput) : null
      };
    }
    if (selectedPriceRangeIndex !== null) {
      return priceRanges[selectedPriceRangeIndex];
    }
    return { min: null, max: null };
  };

  const handleSearchClick = () => {
    const priceRange = getActualPriceRange();
    onSearch({
      keyword: query.trim() || '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating: selectedRating || null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  const handlePriceRangeClick = (index) => {
    setMinPriceInput('');
    setMaxPriceInput('');
    const newIndex = selectedPriceRangeIndex === index ? null : index;
    setSelectedPriceRangeIndex(newIndex);
    const selectedRange = newIndex !== null ? priceRanges[newIndex] : { min: null, max: null };
    onSearch({
      keyword: query.trim() || '',
      minPrice: selectedRange.min,
      maxPrice: selectedRange.max,
      minRating: selectedRating || null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  const handleCustomPriceApply = () => {
    setSelectedPriceRangeIndex(null);
    handleSearchClick();
  };

  const handleRatingClick = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    const priceRange = getActualPriceRange();
    onSearch({
      keyword: query.trim() || '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating: newRating || null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  const handleReset = () => {
    setQuery('');
    setSelectedPriceRangeIndex(null);
    setMinPriceInput('');
    setMaxPriceInput('');
    setSelectedRating(null);
    onSearch({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
    if (onResetAll) onResetAll();
  };

  return (
    <>
      <div className="az-search-wrapper">
        <span className="az-section-label">Tùy chọn nâng cao</span>
        <h2 className="az-section-title">Tìm kiếm sản phẩm</h2>
        <div className="az-section-bar"><span /></div>
        
        <div className="container d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: '680px' }}>

            <div className="az-search-input-row">
              <div className="az-search-input-wrap">
                <i className="bi bi-search az-search-icon" />
                <input
                  type="text"
                  className="az-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tên sản phẩm, thương hiệu cần tìm..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                />
              </div>
              <button className="az-icon-btn az-icon-btn-search" onClick={handleSearchClick} title="Tìm kiếm">
                <i className="bi bi-search" />
              </button>
              <button className="az-icon-btn az-icon-btn-clear" onClick={handleReset} title="Xóa bộ lọc">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="az-filter-panel card">
              
              <div className="az-filter-group">
                <div className="az-filter-label-main">
                  <i className="bi bi-tags-fill me-2" style={{ color: '#a0aaff' }} /> Khoảng giá sản phẩm
                </div>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      className={`az-chip az-chip-price ${selectedPriceRangeIndex === index ? 'active' : ''}`}
                      onClick={() => handlePriceRangeClick(index)}
                    >
                      {selectedPriceRangeIndex === index && <i className="bi bi-check2 me-1" />}
                      {range.label}
                    </button>
                  ))}
                </div>

                <div className="az-custom-price-row">
                  <span className="az-custom-price-text">Hoặc tự nhập khoảng giá:</span>
                  <div className="az-custom-price-inputs">
                    <input 
                      type="number" 
                      className="az-price-input" 
                      placeholder="Giá tối thiểu" 
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                    />
                    <div className="az-line-dash">-</div>
                    <input 
                      type="number" 
                      className="az-price-input" 
                      placeholder="Giá tối đa" 
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                    />
                    <button className="az-custom-price-btn" onClick={handleCustomPriceApply}>
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>

              <div className="az-filter-divider" />

              <div className="az-filter-group">
                <div className="az-filter-label-main">
                  <i className="bi bi-star-fill me-2" style={{ color: '#f9c846' }} /> Đánh giá từ người dùng
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {ratingOptions.map((rating) => (
                    <button
                      key={rating}
                      className={`az-chip az-chip-rating ${selectedRating === rating ? 'active' : ''}`}
                      onClick={() => handleRatingClick(rating)}
                    >
                      <div className="az-stars-wrap">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`bi bi-star-fill ${i < rating ? 'star-active' : 'star-inactive'}`} 
                          />
                        ))}
                      </div>
                      {rating < 5 && <span className="az-rating-text-suffix">trở lên</span>}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="az-reset-row">
              <button
                className={`az-reset-btn-fancy ${hasFilters ? 'visible' : ''}`}
                onClick={handleReset}
                aria-label="Xóa tất cả bộ lọc"
                tabIndex={hasFilters ? 0 : -1}
              >
                <div className="az-reset-pill">
                  <span className="az-reset-icon-bubble">
                    <i className="bi bi-arrow-counterclockwise" />
                  </span>
                  <span className="az-reset-label">Xóa toàn bộ bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="az-reset-count" key={activeFilterCount}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;