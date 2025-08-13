import React from 'react';
import { useCart } from '../shared/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { useEffect } from 'react';


const CartPage = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Giỏ hàng của tôi"; 

    return () => {
        document.title = previousTitle; 
    };
}, []);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container my-5 pt-5">
      <h2 className="mb-4 fw-bold text-center">🛒 Giỏ hàng của bạn</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-4">Giỏ hàng trống.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Quay lại mua sắm
          </button>
        </div>
      ) : (
        <>
          {cartItems.map(item => (
            <CartItemCard key={item.id} item={item} />
          ))}

          <div className="d-flex flex-column align-items-end mt-4">
            <h4 className="fw-bold">Tổng cộng: <span className="text-danger">{subtotal.toLocaleString('vi-VN')}₫</span></h4>
            <button className="btn btn-success btn-lg mt-3 px-5 py-2" onClick={() => navigate('/orders')}>
              Đặt hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
