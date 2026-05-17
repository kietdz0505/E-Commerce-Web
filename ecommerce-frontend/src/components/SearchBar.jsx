import React, { useState } from 'react';
import PaginationConfig from '../config/paginationConfig';
import '../styles/searchBar.css';


const SearchBar = ({ onSearch, onResetAll }) => {
  const [query, setQuery] = useState('');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(null);
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
    (selectedPriceRangeIndex !== null ? 1 : 0) +
    (selectedRating !== null ? 1 : 0);

  const hasFilters = activeFilterCount > 0;

  const handleSearchClick = () => {
    const selectedRange = selectedPriceRangeIndex !== null ? priceRanges[selectedPriceRangeIndex] : null;
    onSearch({
      keyword: query.trim() || '',
      minPrice: selectedRange ? selectedRange.min : null,
      maxPrice: selectedRange ? selectedRange.max : null,
      minRating: selectedRating || null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  const handlePriceRangeClick = (index) => {
    const newIndex = selectedPriceRangeIndex === index ? null : index;
    setSelectedPriceRangeIndex(newIndex);
    const selectedRange = newIndex !== null ? priceRanges[newIndex] : null;
    onSearch({
      keyword: query.trim() || '',
      minPrice: selectedRange ? selectedRange.min : null,
      maxPrice: selectedRange ? selectedRange.max : null,
      minRating: selectedRating || null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  const handleRatingClick = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    const selectedRange = selectedPriceRangeIndex !== null ? priceRanges[selectedPriceRangeIndex] : null;
    onSearch({
      keyword: query.trim() || '',
      minPrice: selectedRange?.min ?? null,
      maxPrice: selectedRange?.max ?? null,
      minRating: newRating ?? null,
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
  };

  // Xóa state nội bộ của SearchBar + báo cho Home reset toàn bộ
  const handleReset = () => {
    setQuery('');
    setSelectedPriceRangeIndex(null);
    setSelectedRating(null);
    onSearch({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      page: 0,
      size: PaginationConfig.DEFAULT_PAGE_SIZE,
    });
    // Gọi thêm callback của Home nếu có (reset category, brand, v.v.)
    if (onResetAll) onResetAll();
  };

  return (
    <>
      <div className="az-search-wrapper">
        <span className="az-section-label">Tùy chọn</span>
            <h2 className="az-section-title">Tìm kiếm sản phẩm</h2>
            <div className="az-section-bar"><span /></div>
        <div className="container d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: '620px' }}>

            {/* Search input row */}
            <div className="az-search-input-row">
              <div className="az-search-input-wrap">
                <i className="bi bi-search az-search-icon" />
                <input
                  type="text"
                  className="az-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
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

            {/* Price filter */}
            <div className="az-filter-label">Lọc theo giá</div>
            <div className="d-flex flex-wrap gap-2">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  className={`az-chip az-chip-price ${selectedPriceRangeIndex === index ? 'active' : ''}`}
                  onClick={() => handlePriceRangeClick(index)}
                >
                  {selectedPriceRangeIndex === index && <i className="bi bi-check2" style={{ fontSize: '0.75rem' }} />}
                  {range.label}
                </button>
              ))}
            </div>

            <div className="az-filter-divider" />

            {/* Rating filter */}
            <div className="az-filter-label">Lọc theo đánh giá</div>
            <div className="d-flex flex-wrap gap-2">
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  className={`az-chip az-chip-rating ${selectedRating === rating ? 'active' : ''}`}
                  onClick={() => handleRatingClick(rating)}
                >
                  <span className="star">{'★'.repeat(rating)}</span>
                  {rating < 5 && <span style={{ opacity: 0.35 }}>{'★'.repeat(5 - rating)}</span>}
                  &nbsp;trở lên
                </button>
              ))}
            </div>

            {/* ── Reset button — chỉ hiện khi có filter active ── */}
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
                  <span className="az-reset-label">Xóa bộ lọc</span>
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