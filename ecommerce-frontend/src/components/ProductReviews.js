import React, { useEffect, useState } from 'react';
import { fetchProductReviews } from '../api/reviewApi';

const ProductReviews = ({ productId, appendedReviews = [] }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProductReviews(productId)
      .then(res => setReviews(res.data))
      .catch(err => console.error('Failed to fetch reviews', err));
  }, [productId]);

  // Combine fetched reviews with newly appended ones
  const combinedReviews = [...appendedReviews, ...reviews];

  return (
    <div className="mt-5">
      <h4>Đánh giá sản phẩm</h4>
      {combinedReviews.length === 0 ? (
        <p>Chưa có đánh giá nào.</p>
      ) : (
        combinedReviews.map((review) => (
          <div key={review.id} className="border rounded-3 p-3 mb-3">
            <div className="d-flex align-items-center mb-2">
              <img src={review.userAvatar} alt="Avatar" className="rounded-circle me-2" width={40} height={40} />
              <strong>{review.userName}</strong>
            </div>
            <div className="mb-2">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}></i>
              ))}
            </div>
            <p>{review.comment}</p>
            {review.imageUrl && <img src={review.imageUrl} alt="Review" className="img-fluid rounded" style={{ maxWidth: '200px' }} />}
            <p className="text-muted small">Đánh giá lúc: {new Date(review.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductReviews;
