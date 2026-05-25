import React, { useState, useEffect } from 'react';
import { useCart } from '../shared/CartContext';
import { confirmDelete } from '../shared/ConfirmDialog';
import { FaTrash } from 'react-icons/fa';
import '../styles/cartItemCard.css';

const CartItemCard = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const stock = item.product.stock;
  const [inputQty, setInputQty] = useState(item.quantity);

  useEffect(() => {
    setInputQty(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') return setInputQty('');

    let num = parseInt(value, 10);
    if (num < 1) num = 1;
    if (num > stock) num = stock;

    setInputQty(num);
  };

  const commitQuantity = () => {
    let num = inputQty === '' ? 1 : inputQty;
    if (num < 1) num = 1;
    if (num > stock) num = stock;

    setInputQty(num);

    if (num !== item.quantity) {
      updateItemQuantity(item.id, num);
    }
  };

  const handleDecrement = () => {
    if (inputQty > 1) {
      const newQty = inputQty - 1;
      setInputQty(newQty);
      updateItemQuantity(item.id, newQty);
    }
  };

  const handleIncrement = () => {
    if (inputQty < stock) {
      const newQty = inputQty + 1;
      setInputQty(newQty);
      updateItemQuantity(item.id, newQty);
    }
  };

  return (
    <div className="az-cart-item">

      {/* IMAGE */}
      <div className="az-cart-img">
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
        />
      </div>

      {/* INFO */}
      <div className="az-cart-info">
        <h4 className="az-cart-name">
          {item.product.name}
        </h4>

        <div className="az-cart-price">
          {item.price.toLocaleString('vi-VN')}₫
        </div>

        <div className="az-cart-stock">
          Còn lại: <span>{stock}</span>
        </div>

        {/* QUANTITY */}
        <div className="az-cart-qty">
          <button onClick={handleDecrement} disabled={inputQty <= 1}>
            -
          </button>

          <input
            type="text"
            value={inputQty}
            onChange={handleQuantityChange}
            onBlur={commitQuantity}
            onKeyDown={(e) => e.key === 'Enter' && commitQuantity()}
          />

          <button onClick={handleIncrement} disabled={inputQty >= stock}>
            +
          </button>
        </div>
      </div>

      {/* ACTION */}
      <div className="az-cart-action">
        <div className="az-cart-total">
          <span>Tổng: </span>
          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
        </div>

        <button
          className="az-cart-delete"
          onClick={async () => {
            const result = await confirmDelete(
              'Xóa sản phẩm khỏi giỏ hàng?',
              'Không thể hoàn tác!'
            );
            if (result.isConfirmed) {
              removeItem(item.id);
            }
          }}
        >
          <FaTrash />
        </button>
      </div>

    </div>
  );
};

export default CartItemCard;