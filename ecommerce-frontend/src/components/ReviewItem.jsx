import React, { useState } from 'react';
import { confirmDelete } from '../shared/ConfirmDialog';


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
            onClick={async () => {
              const result = await confirmDelete('Bạn có chắc chắn muốn xóa đánh giá này?', 'Hành động này không thể hoàn tác!');
              if (result.isConfirmed) {
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

export default ReviewItem;