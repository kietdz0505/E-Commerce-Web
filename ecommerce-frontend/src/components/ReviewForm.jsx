import React, { useState, useEffect } from 'react';
import { submitReview } from '../api/reviewApi';
import { FaStar } from "react-icons/fa";
import '../styles/reviewForm.css';

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
    formData.append('rating', rating);
    if (image) formData.append('image', image);

    try {
      setIsSubmitting(true);
      const res = await submitReview(productId, formData);
      onReviewSubmitted(res.data);

      setComment('');
      setRating(5);
      setImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="az-review-login">
        Vui lòng{' '}
        <span onClick={onLoginClick}>
          đăng nhập
        </span>{' '}
        để viết đánh giá
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="az-review-form">
      <h4 className="az-review-form-title">Viết đánh giá</h4>

      {/* RATING */}
      <div className="az-review-stars-input">
        {[1, 2, 3, 4, 5].map((val) => (
          <FaStar
            key={val}
            className={val <= rating ? 'filled' : ''}
            onClick={() => setRating(val)}
          />
        ))}
      </div>

      {/* COMMENT */}
      <textarea
        placeholder="Chia sẻ trải nghiệm của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      {/* IMAGE */}
      <div className="az-review-upload">
        <label>
          📷 Thêm ảnh (tuỳ chọn)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>

        {image && <span className="az-file-name">{image.name}</span>}
      </div>

      {/* ACTION */}
      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="az-submit-btn"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
};

export default ReviewForm;