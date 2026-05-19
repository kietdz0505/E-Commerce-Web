// src/components/ProductReviews.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchProductReviews,
  deleteReview,
  updateReview
} from '../api/reviewApi';

import PaginationConfig from '../config/paginationConfig';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

import '../styles/productReview.css';

const ProductReviews = ({
  productId,
  appendedReviews = []
}) => {

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [hasPurchased, setHasPurchased] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const loadReviews = useCallback(async (pageNumber) => {

    setLoading(true);

    try {

      const res = await fetchProductReviews(
        productId,
        pageNumber,
        PaginationConfig.REVIEW_PAGE_SIZE
      );

      const data = res.data;

      console.log('REVIEW API DATA = ', data);

      setHasPurchased(data.hasPurchased);
      setMyReview(data.myReview);
      setHasMore(!data.last);

      const fetchedReviews = data.content || [];

      setReviews(prev => {

        const combined = [...prev, ...fetchedReviews];

        return Array.from(
          new Map(
            combined.map(review => [review.id, review])
          ).values()
        );

      });

    } catch (err) {

      console.error(
        'Failed to fetch reviews',
        err
      );

    } finally {

      setLoading(false);

    }

  }, [productId]);

  useEffect(() => {

    setReviews([]);
    setPage(0);
    setHasMore(true);
    setMyReview(null);

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

      setReviews(prev =>
        prev.filter(review => review.id !== reviewId)
      );

      if (
        myReview &&
        myReview.id === reviewId
      ) {

        setMyReview(null);

      }

    } catch (err) {

      console.error(
        'Failed to delete review',
        err
      );

    }

  };

  const handleUpdateReview = async (
    reviewId,
    comment,
    rating,
    image
  ) => {

    try {

      const formData = new FormData();

      formData.append('comment', comment);
      formData.append('rating', rating);

      if (image) {

        formData.append('image', image);

      }

      const updated = await updateReview(
        productId,
        reviewId,
        formData
      );

      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
              ...review,
              ...updated.data
            }
            : review
        )
      );

      if (
        myReview &&
        myReview.id === reviewId
      ) {

        setMyReview({
          ...myReview,
          ...updated.data
        });

      }

    } catch (err) {

      console.error(
        'Failed to update review',
        err
      );

    }

  };

  const combinedReviews = Array.from(

    new Map(

      [
        ...appendedReviews,
        ...reviews
      ]

        .filter(review =>
          !myReview ||
          review.id !== myReview.id
        )

        .map(review => [
          review.id,
          review
        ])

    ).values()

  );

  return (

    <div className="az-review-container">

      <div className="az-review-header">

        <h3>Đánh giá sản phẩm</h3>

        <span className="az-review-count">
          {combinedReviews.length + (myReview ? 1 : 0)} đánh giá
        </span>

      </div>

      {!hasPurchased && (

        <div className="az-review-warning">
          Bạn cần mua sản phẩm trước khi có thể đánh giá.
        </div>

      )}

      {hasPurchased && myReview && (

        <div className="az-my-review-section">

          <div className="az-review-success">
            Bạn đã đánh giá sản phẩm này.
            Bạn có thể chỉnh sửa hoặc xoá đánh giá.
          </div>

          <ReviewItem
            review={myReview}
            onDelete={handleDeleteReview}
            onUpdate={handleUpdateReview}
          />

        </div>

      )}

      {hasPurchased && !myReview && (

        <div className="az-review-form-wrapper">

          <div className="az-review-allowed">
            Bạn đã mua sản phẩm. Hãy chia sẻ trải nghiệm của bạn.
          </div>

          <ReviewForm
            productId={productId}
            onReviewSubmitted={(newReview) => {

              setMyReview(newReview);

            }}
          />

        </div>

      )}

      {combinedReviews.length === 0 ? (

        <div className="az-review-empty">
          Chưa có đánh giá nào.
        </div>

      ) : (

        <div className="az-review-list">

          {combinedReviews.map(review => (

            <ReviewItem
              key={review.id}
              review={review}
              onDelete={handleDeleteReview}
              onUpdate={handleUpdateReview}
            />

          ))}

        </div>

      )}

      {hasMore && (

        <div className="az-review-loadmore">

          <button
            className="az-loadmore-btn"
            onClick={handleLoadMore}
            disabled={loading}
          >

            {loading
              ? 'Đang tải...'
              : 'Xem thêm đánh giá'}

          </button>

        </div>

      )}

    </div>

  );

};

export default ProductReviews;