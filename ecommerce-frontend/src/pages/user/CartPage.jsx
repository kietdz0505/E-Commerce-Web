import React, { useEffect, useState } from 'react';
import { useCart } from '../../shared/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../../components/CartItemCard';
import { useAuth } from '../../shared/AuthContext';

import {
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineCube
} from "react-icons/hi2";

import '../../styles/cartPage.css';

const CartPage = () => {
  const { cartItems } = useCart();
  const { currentUser } = useAuth(); 

  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false); 

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Giỏ hàng của tôi";
    return () => (document.title = previousTitle);
  }, []);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!currentUser) {
      setShowLogin(true); // hoặc dùng context nếu bạn đã global popup
      return;
    }
    navigate('/orders');
  };

  return (
    <div className="az-cart-container">
      
      {/* ===== TITLE ===== */}
      <h2 className="az-cart-title">
        <HiOutlineShoppingCart className="az-title-icon" />
        Giỏ hàng của bạn
      </h2>

      {/* ===== EMPTY ===== */}
      {cartItems.length === 0 ? (
        <div className="az-cart-empty">
          <HiOutlineShoppingCart className="az-empty-icon" />
          <p>Giỏ hàng trống</p>

          <button
            onClick={() => navigate('/')}
            className="az-btn-primary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="az-cart-layout">

          {/* ===== LEFT: ITEMS ===== */}
          <div className="az-cart-list">
            {cartItems.map(item => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* ===== RIGHT: SUMMARY ===== */}
          <div className="az-cart-summary">
            <h4>
              <HiOutlineCube className="az-summary-icon" />
              Tóm tắt đơn hàng
            </h4>

            <div className="az-cart-row">
              <span>
                <HiOutlineShoppingCart className="az-row-icon" />
                Tạm tính
              </span>
              <strong>{subtotal.toLocaleString('vi-VN')}₫</strong>
            </div>

            <div className="az-cart-row total">
              <span>
                <HiOutlineStar className="az-row-icon" />
                Tổng cộng:
              </span>
               <p>{subtotal.toLocaleString('vi-VN')}₫</p>
            </div>

            <button
              className="az-btn-checkout"
              onClick={handleCheckout}
            >
              <HiOutlineShoppingCart className="az-btn-icon" />
              Thanh toán
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;