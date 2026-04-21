import React, { useState, useEffect } from 'react';
import { useCart } from '../shared/CartContext';
import { confirmDelete } from '../shared/ConfirmDialog';
import { FaTrash } from 'react-icons/fa';

const CartItemCard = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const stock = item.product.stock;
  const [inputQty, setInputQty] = useState(item.quantity);

  // Đồng bộ nếu quantity thay đổi từ context (trường hợp cập nhật bên ngoài)
  useEffect(() => {
    setInputQty(item.quantity);
  }, [item.quantity]);

  // Khi user nhập trực tiếp
  const handleQuantityChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // chỉ giữ số
    if (value === '') {
      setInputQty('');
      return;
    }
    let num = parseInt(value, 10);
    if (num < 1) num = 1;
    if (num > stock) num = stock;
    setInputQty(num);
  };

  // Commit số lượng vào CartContext
  const commitQuantity = () => {
    let num = inputQty === '' ? 1 : inputQty;
    if (num < 1) num = 1;
    if (num > stock) num = stock;

    setInputQty(num);
    if (num !== item.quantity) {
      updateItemQuantity(item.id, num);
    }
  };

  // Giảm số lượng (nút -)
  const handleDecrement = () => {
    if (inputQty > 1) {
      const newQty = inputQty - 1;
      setInputQty(newQty); // cập nhật local trước
      updateItemQuantity(item.id, newQty); // sync vào context
    }
  };

  // Tăng số lượng (nút +)
  const handleIncrement = () => {
    if (inputQty < stock) {
      const newQty = inputQty + 1;
      setInputQty(newQty); // cập nhật local trước
      updateItemQuantity(item.id, newQty); // sync vào context
    }
  };

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
            <p className="text-danger fw-bold fs-5">
              {item.price.toLocaleString('vi-VN')}₫
            </p>

            <p className="text-muted mb-1">
              Còn lại: <span className="fw-semibold">{stock}</span> sản phẩm
            </p>

            <div className="d-flex align-items-center mt-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleDecrement}
                disabled={inputQty <= 1}
              >
                -
              </button>

              <input
                type="number"
                className="form-control mx-2 text-center"
                style={{ width: '80px' }}
                value={inputQty}
                onChange={handleQuantityChange}
                onBlur={commitQuantity}
                onKeyDown={(e) => e.key === 'Enter' && commitQuantity()}
                min="1"
                max={stock}
              />

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleIncrement}
                disabled={inputQty >= stock}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-3 d-flex flex-column align-items-center justify-content-center">
          <h5 className="text-primary">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
          </h5>
          <button
            className="btn btn-outline-danger btn-sm mt-2"
            onClick={async () => {
              const result = await confirmDelete(
                'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
                'Hành động này không thể hoàn tác!'
              );
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

