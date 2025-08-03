import React, { useEffect, useState, useCallback } from 'react';
import { fetchProductReviews, deleteReview, updateReview } from '../api/reviewApi';
import PaginationConfig from '../config/paginationConfig';

const ReviewItem = ({ review, onDelete, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editComment, setEditComment] = useState(review.comment);
  const [editRating, setEditRating] = useState(review.rating);
  const [editImage, setEditImage] = useState(null);

  const toggleExpand = () => setExpanded(!expanded);
  const shouldTruncate = review.comment.length > 150;
  const displayedComment = expanded || !shouldTruncate
    ? review.comment
    : review.comment.slice(0, 150) + '...';

  const handleSave = () => {
    onUpdate(review.id, editComment, editRating, editImage);
    setEditing(false);
  };

  return (
    <div className={`border rounded-3 p-3 mb-3 ${review.owner ? 'border-primary' : ''}`}>
      <div className="d-flex align-items-center mb-2">
        <img src={review.userAvatar} alt="Avatar" className="rounded-circle me-2" width={40} height={40} />
        <strong>{review.userName}</strong>
      </div>
      <div className="mb-2">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}></i>
        ))}
      </div>

      {editing ? (
        <>
          <textarea
            className="form-control mb-2"
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
          <div className="mb-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <i
                key={val}
                className={`bi ${val <= editRating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} fs-4 me-1`}
                style={{ cursor: 'pointer' }}
                onClick={() => setEditRating(val)}
              ></i>
            ))}
          </div>

          <input
            type="file"
            className="form-control mb-2"
            accept="image/*"
            onChange={(e) => setEditImage(e.target.files[0])}
          />
          <button className="btn btn-success btn-sm me-2" onClick={handleSave}>Lưu</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Hủy</button>
        </>
      ) : (
        <>
          <p>{displayedComment}</p>
          {shouldTruncate && (
            <button className="btn btn-link btn-sm p-0" onClick={toggleExpand}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </>
      )}

      {review.imageUrl && (
        <img src={review.imageUrl} alt="Review" className="img-fluid rounded mt-2" style={{ maxWidth: '200px' }} />
      )}

      <p className="text-muted small">Đánh giá lúc: {new Date(review.createdAt).toLocaleString('vi-VN')}</p>

      {review.owner && !editing && (
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(true)}>Chỉnh sửa</button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              const confirmed = window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?');
              if (confirmed) {
                onDelete(review.id);
              }
            }}
          >
            Xóa
          </button>
        </div>
      )}

    </div>
  );
};

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
