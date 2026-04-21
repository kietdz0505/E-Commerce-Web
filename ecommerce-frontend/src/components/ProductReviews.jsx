// src/components/ProductReviews.js
import React, { useEffect, useState, useCallback } from 'react';
import { fetchProductReviews, deleteReview, updateReview } from '../api/reviewApi';
import PaginationConfig from '../config/paginationConfig';
import ReviewItem from './ReviewItem';

const ProductReviews = ({ productId, appendedReviews = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetchProductReviews(productId, pageNumber, PaginationConfig.REVIEW_PAGE_SIZE);
      const fetchedReviews = res.data.content;

      if (res.data.last) setHasMore(false);

      setReviews(prev => {
        const combined = [...prev, ...fetchedReviews];
        return Array.from(new Map(combined.map(r => [r.id, r])).values());
      });
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setReviews([]);
    setPage(0);
    setHasMore(true);
    loadReviews(0);
  }, [productId, loadReviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(productId, reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  const handleUpdateReview = async (reviewId, comment, rating, image) => {
    try {
      const formData = new FormData();
      formData.append('comment', comment);
      formData.append('rating', rating);
      if (image) {
        formData.append('image', image);
      }

      const updated = await updateReview(productId, reviewId, formData);
      setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, ...updated.data } : r)));
    } catch (err) {
      console.error('Failed to update review', err);
    }
  };

  const combinedReviews = Array.from(
    new Map([...appendedReviews, ...reviews].map(r => [r.id, r])).values()
  );

  return (
    <div className="mt-5">
      <h4>Đánh giá sản phẩm</h4>
      {combinedReviews.length === 0 ? (
        <p>Chưa có đánh giá nào.</p>
      ) : (
        combinedReviews.map(review => (
          <ReviewItem key={review.id} review={review} onDelete={handleDeleteReview} onUpdate={handleUpdateReview} />
        ))
      )}

      {hasMore && (
        <div className="text-center mt-3">
          <button className="btn btn-outline-primary" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;