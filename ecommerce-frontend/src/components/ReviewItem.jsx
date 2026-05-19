import React, { useState } from 'react';
import { confirmDelete, showSuccess, showError } from '../shared/ConfirmDialog';
import { FaStar } from "react-icons/fa";
import "../styles/reviewItem.css";

const ReviewItem = ({ review, onDelete, onUpdate }) => {

  const [expanded, setExpanded] = useState(false);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [editComment, setEditComment] = useState(review.comment);

  const [editRating, setEditRating] = useState(review.rating);

  const [editImage, setEditImage] = useState(null);

  const [previewImage, setPreviewImage] = useState(review.imageUrl);

  const toggleExpand = () => setExpanded(!expanded);

  const shouldTruncate = review.comment.length > 150;

  const displayedComment =
    expanded || !shouldTruncate
      ? review.comment
      : review.comment.slice(0, 150) + '...';

  // ===== IMAGE CHANGE =====
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setEditImage(file);

    setPreviewImage(URL.createObjectURL(file));
  };

  // ===== SAVE =====
  const handleSave = async () => {

    if (!editComment.trim()) {
      showError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {

      setSaving(true);

      await onUpdate(
        review.id,
        editComment,
        editRating,
        editImage
      );

      showSuccess('Đã cập nhật đánh giá!');

      setEditing(false);

    } catch (err) {

      console.error(err);

      showError('Không thể cập nhật đánh giá');

    } finally {

      setSaving(false);

    }
  };

  // ===== DELETE =====
  const handleDelete = async () => {

    const result = await confirmDelete(
      'Xóa đánh giá?',
      'Bạn sẽ không thể khôi phục!'
    );

    if (!result.isConfirmed) return;

    try {

      await onDelete(review.id);

      showSuccess('Đã xóa thành công!');

    } catch (err) {

      console.error(err);

      showError('Không thể xóa đánh giá');

    }
  };

  return (

    <div className={`az-review-item ${review.owner ? 'az-review-owner' : ''}`}>

      {/* ===== HEADER ===== */}
      <div className="az-review-top">

        <div className="az-review-user">

          <img
            src={
              review.userAvatar ||
              'https://ui-avatars.com/api/?name=User'
            }
            alt={review.userName}
          />

          <div>

            <div className="az-review-name">
              {review.userName}
            </div>

            <div className="az-review-time">
              {new Date(review.createdAt)
                .toLocaleString('vi-VN')}
            </div>

          </div>
        </div>

        {/* ===== RATING ===== */}
        <div className="az-review-stars">

          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < review.rating ? 'filled' : ''}
            />
          ))}

        </div>

      </div>

      {/* ===== EDIT MODE ===== */}
      {editing ? (

        <div className="az-review-edit">

          <textarea
            value={editComment}
            onChange={(e) =>
              setEditComment(e.target.value)
            }
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />

          {/* ===== STARS ===== */}
          <div className="az-review-stars-edit">

            {[1, 2, 3, 4, 5].map((val) => (
              <FaStar
                key={val}
                className={
                  val <= editRating ? 'filled' : ''
                }
                onClick={() => setEditRating(val)}
              />
            ))}

          </div>

          {/* ===== IMAGE ===== */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* ===== PREVIEW ===== */}
          {previewImage && (
            <img
              src={previewImage}
              alt=""
              className="az-review-img"
            />
          )}

          {/* ===== ACTIONS ===== */}
          <div className="az-review-actions">

            <button
              className="az-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>

            <button
              className="az-btn-cancel"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Hủy
            </button>

          </div>

        </div>

      ) : (

        <>
          {/* ===== COMMENT ===== */}
          <p className="az-review-comment">
            {displayedComment}
          </p>

          {shouldTruncate && (
            <span
              className="az-review-toggle"
              onClick={toggleExpand}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </span>
          )}

          {/* ===== IMAGE ===== */}
          {review.imageUrl && (
            <img
              src={review.imageUrl}
              alt=""
              className="az-review-img"
            />
          )}

          {/* ===== OWNER ACTIONS ===== */}
          {review.owner && (

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

        </>

      )}

    </div>
  );
};

export default ReviewItem;