// src/components/ReviewForm.js

import React, {
  useState
} from 'react';

import {
  submitReview
} from '../api/reviewApi';

import {
  FaStar
} from "react-icons/fa";

import '../styles/reviewForm.css';

const ReviewForm = ({
  productId,
  onReviewSubmitted
}) => {

  const [comment, setComment] =
    useState('');

  const [rating, setRating] =
    useState(5);

  const [image, setImage] =
    useState(null);

  const [
    isSubmitting,
    setIsSubmitting
  ] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setIsSubmitting(true);

      const formData =
        new FormData();

      formData.append(
        'comment',
        comment
      );

      formData.append(
        'rating',
        rating
      );

      if (image) {

        formData.append(
          'image',
          image
        );

      }

      const res =
        await submitReview(
          productId,
          formData
        );

      onReviewSubmitted(
        res.data
      );

      setComment('');

      setRating(5);

      setImage(null);

    } catch (err) {

      console.error(
        'Submit review failed:',
        err
      );

    } finally {

      setIsSubmitting(false);

    }

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="az-review-form"
    >

      <h4 className="az-review-form-title">

        Viết đánh giá

      </h4>

      {/* STARS */}

      <div className="az-review-stars-input">

        {[1, 2, 3, 4, 5].map(
          (val) => (

            <FaStar
              key={val}
              className={
                val <= rating
                  ? 'filled'
                  : ''
              }
              onClick={() =>
                setRating(val)
              }
            />

          )
        )}

      </div>

      {/* COMMENT */}

      <textarea
        placeholder="Chia sẻ trải nghiệm của bạn..."
        value={comment}
        onChange={(e) =>
          setComment(
            e.target.value
          )
        }
        required
      />

      {/* IMAGE */}

      <div className="az-review-upload">

        <label>

          📷 Thêm ảnh
          (tuỳ chọn)

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files[0]
              )
            }
          />

        </label>

        {image && (

          <div className="az-image-preview">

            <img
              src={URL.createObjectURL(image)}
              alt="preview"
            />

          </div>

        )}

      </div>

      {/* SUBMIT */}

      <button
        type="submit"
        className="az-submit-btn"
        disabled={
          isSubmitting ||
          !comment.trim() ||
          rating < 1
        }
      >

        {isSubmitting
          ? 'Đang gửi...'
          : 'Gửi đánh giá'}

      </button>

    </form>

  );

};

export default ReviewForm;