import React from 'react';
import ProductCard from '../../shared/ProductCard';
import Pagination from '../../shared/Pagination';
import '../../styles/productList.css';

const ProductList = ({ products, selectedCategoryId, currentPage, totalPages, onPageChange, loading }) => {
  return (
    <section className="az-productlist-section">
      <div className="container position-relative">
        <div className="az-productlist-header">
          <span className="az-productlist-eyebrow">
            {selectedCategoryId ? 'Danh mục' : 'Nổi bật'}
          </span>
          <h2 className="az-productlist-title">
            {selectedCategoryId ? 'Sản phẩm theo danh mục' : 'Sản phẩm nổi bật'}
          </h2>
          <div><span className="az-productlist-title-bar" /></div>
        </div>

        {loading ? (
          <div className="az-loading-wrap">
            <div className="az-spinner" />
            <span className="az-loading-text">Đang tải sản phẩm...</span>
          </div>
        ) : (!products || !Array.isArray(products) || products.length === 0) ? (
          <div className="az-empty-wrap">
            <div className="az-empty-icon">
              <i className="bi bi-inbox" />
            </div>
            <span className="az-empty-text">Không tìm thấy sản phẩm nào.</span>
          </div>
        ) : (
          <div className="product-wrapper">
            {products.map((prod, idx) => (
              <ProductCard
                key={prod.id || prod._id || idx}
                prod={prod}
                isHot={!selectedCategoryId && idx < 4}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </section>
  );
};

export default ProductList;