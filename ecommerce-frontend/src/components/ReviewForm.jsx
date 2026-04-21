import React, { useState, useEffect } from 'react';
import { submitReview } from '../api/reviewApi';

const ReviewForm = ({ productId, onReviewSubmitted, onLoginClick }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      onLoginClick();
      return;
    }

    const formData = new FormData();
    formData.append('comment', comment);
    formData.append('rating', rating); // vẫn là string, backend tự cast int
    if (image) {
      formData.append('image', image);
    }

    try {
      setIsSubmitting(true);
      const response = await submitReview(productId, formData);
      onReviewSubmitted(response.data);

      // Reset form
      setComment('');
      setRating(5);
      setImage(null);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="alert alert-warning mt-4">
        Vui lòng <button onClick={onLoginClick} className="btn btn-link p-0">đăng nhập</button> để viết đánh giá.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h5>Viết đánh giá</h5>
      <div className="mb-3">
        <label className="form-label">Số sao</label>
        <div>
          {[1, 2, 3, 4, 5].map((val) => (
            <i
              key={val}
              className={`bi ${val <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} fs-4 me-1`}
              style={{ cursor: 'pointer' }}
              onClick={() => setRating(val)}
            ></i>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Bình luận</label>
        <textarea
          className="form-control"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          required
        ></textarea>
      </div>
      <div className="mb-3">
        <label className="form-label">Ảnh (tuỳ chọn)</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting || !comment.trim()}
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
};

export default ReviewForm;
