import React from 'react';

const CartSummary = ({ cartItems, selectedPromotion, calculateItemDiscountedPrice, calculateTotal, isProductInPromotion }) => {
    return (
        <>
            <h4 className="fw-bold mb-3">🛒 Sản phẩm trong giỏ</h4>
            {cartItems.map(item => {
                const isDiscounted = selectedPromotion && isProductInPromotion(item.product.id, selectedPromotion);
                const discountedPrice = calculateItemDiscountedPrice(item);
                const itemTotal = item.price * item.quantity;
                const discountedTotal = discountedPrice * item.quantity;

                return (
                    <div key={item.id} className="d-flex align-items-center mb-3">
                        <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px' }}
                            className="rounded"
                        />
                        <div>
                            <p className="mb-1 fw-bold">{item.product.name}</p>
                            <p className="text-muted mb-1">Đơn giá: {item.price.toLocaleString('vi-VN')}₫</p>
                            <p className="text-muted mb-1">Số lượng: {item.quantity}</p>
                            {isDiscounted ? (
                                <p className="mb-1">
                                    Tổng: <span className="text-decoration-line-through me-2">{itemTotal.toLocaleString('vi-VN')}₫</span>
                                    <span className="text-success fw-bold">{discountedTotal.toLocaleString('vi-VN')}₫</span>
                                </p>
                            ) : (
                                <p className="mb-1 fw-bold">Tổng: {itemTotal.toLocaleString('vi-VN')}₫</p>
                            )}
                        </div>
                    </div>
                );
            })}

            <hr />
            <h5 className="fw-bold">Tổng cộng: <span className="text-danger">{calculateTotal().toLocaleString('vi-VN')}₫</span></h5>
            {selectedPromotion && (
                <p className="text-info">
                    Mã giảm giá áp dụng: <strong>{selectedPromotion.code}</strong>
                </p>
            )}
        </>
    );
};

export default CartSummary;
