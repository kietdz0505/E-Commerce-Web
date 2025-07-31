import React from 'react';
import ProductCard from '../shared/ProductCard';
import Pagination from '../shared/Pagination';

const ProductList = ({ products, selectedCategoryId, currentPage, totalPages, onPageChange, loading }) => {
  return (
    <section className="py-4 bg-light">
      <div className="container">
        <h2 className="mb-4 text-center">
          {selectedCategoryId ? 'Sản phẩm theo danh mục' : 'Sản phẩm nổi bật'}
        </h2>

        {loading ? (
          <div className="text-center">Đang tải sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-danger">Không có sản phẩm.</div>
        ) : (
          <div className="row g-4 justify-content-center">
            {products.map((prod, idx) => (
              <ProductCard key={prod.id || prod._id || prod.name} prod={prod} isHot={!selectedCategoryId && idx < 4} />
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
