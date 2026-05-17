import React, { useState } from 'react';
import { confirmDelete, showSuccess } from '../shared/ConfirmDialog';
import { FaStar } from "react-icons/fa";
import "../styles/reviewItem.css";

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

  // ===== SAVE =====
  const handleSave = async () => {
    await onUpdate(review.id, editComment, editRating, editImage);
    setEditing(false);
    showSuccess('Đã cập nhật đánh giá!');
  };

  // ===== DELETE =====
  const handleDelete = async () => {
    const result = await confirmDelete(
      'Xóa đánh giá?',
      'Bạn sẽ không thể khôi phục!'
    );

    if (result.isConfirmed) {
      await onDelete(review.id);
      showSuccess('Đã xóa thành công!');
    }
  };

  return (
    <div className={`az-review-item ${review.owner ? 'az-review-owner' : ''}`}>

      {/* ===== HEADER ===== */}
      <div className="az-review-top">
        <div className="az-review-user">
          <img src={review.userAvatar} alt="" />
          <div>
            <div className="az-review-name">{review.userName}</div>
            <div className="az-review-time">
              {new Date(review.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* RATING */}
        <div className="az-review-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < review.rating ? 'filled' : ''} />
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {editing ? (
        <div className="az-review-edit">

          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />

          <div className="az-review-stars-edit">
            {[1, 2, 3, 4, 5].map((val) => (
              <FaStar
                key={val}
                className={val <= editRating ? 'filled' : ''}
                onClick={() => setEditRating(val)}
              />
            ))}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEditImage(e.target.files[0])}
          />

          <div className="az-review-actions">
            <button className="az-btn-save" onClick={handleSave}>
              Lưu
            </button>

            <button
              className="az-btn-cancel"
              onClick={() => setEditing(false)}
            >
              Hủy
            </button>
          </div>
        </div>

      ) : (
        <>
          <p className="az-review-comment">{displayedComment}</p>

          {shouldTruncate && (
            <span className="az-review-toggle" onClick={toggleExpand}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </span>
          )}
        </>
      )}

      {/* ===== IMAGE ===== */}
      {review.imageUrl && (
        <img src={review.imageUrl} alt="" className="az-review-img" />
      )}

      {/* ===== ACTIONS ===== */}
      {review.owner && !editing && (
        <div className="az-review-actions">

          <button
            className="az-btn-edit"
            onClick={() => setEditing(true)}
          >
            Chỉnh sửa
          </button>

          <button
            className="az-btn-delete"
            onClick={handleDelete}
          >
            Xóa
          </button>

        </div>
      )}
    </div>
  );
};

export default ReviewItem;