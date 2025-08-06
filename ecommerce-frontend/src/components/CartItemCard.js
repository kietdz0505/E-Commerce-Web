import React from 'react';
import { useCart } from '../shared/CartContext';
import { confirmDelete } from '../shared/ConfirmDialog';
import { FaTrash } from 'react-icons/fa';

const CartItemCard = ({ item }) => {
  const { incrementItem, decrementItem, removeItem } = useCart();

  return (
    <div className="card mb-4 shadow-sm border-0 rounded-4">
      <div className="row g-0 align-items-center">
        <div className="col-md-3 text-center">
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="img-fluid rounded-3 p-3"
            style={{ height: '150px', objectFit: 'contain', background: '#f8f9fa' }}
          />
        </div>
        <div className="col-md-6">
          <div className="card-body">
            <h5 className="card-title">{item.product.name}</h5>
            <p className="text-danger fw-bold fs-5">{item.price.toLocaleString('vi-VN')}₫</p>
            <div className="d-flex align-items-center mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => decrementItem(item.id)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="mx-3 fs-5">{item.quantity}</span>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => incrementItem(item.id)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-3 d-flex flex-column align-items-center justify-content-center">
          <h5 className="text-primary">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</h5>
          <button
            className="btn btn-outline-danger btn-sm mt-2"
            onClick={async () => {
              const result = await confirmDelete('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?', 'Hành động này không thể hoàn tác!');
              if (result.isConfirmed) {
                removeItem(item.id);
              }
            }}
          >
            <FaTrash className="me-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
