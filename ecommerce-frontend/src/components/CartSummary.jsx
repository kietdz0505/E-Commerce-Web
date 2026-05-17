import React from 'react';
import '../styles/cartSummary.css';
import {
  HiOutlineShoppingCart,
  HiOutlineTag,
  HiOutlineReceiptPercent
} from "react-icons/hi2";

import { FaBoxOpen } from "react-icons/fa";

const CartSummary = ({
    cartItems,
    selectedPromotion,
    calculateItemDiscountedPrice,
    calculateTotal,
    isProductInPromotion
}) => {
    return (
        <div className="az-summary-box">

            {/* HEADER */}
            <h4 className="az-summary-title">
                <HiOutlineShoppingCart className="me-2" />
                 Sản phẩm trong giỏ
            </h4>

            {/* ITEMS */}
            <div className="az-summary-list">
                {cartItems.map(item => {
                    const isDiscounted =
                        selectedPromotion &&
                        isProductInPromotion(item.product.id, selectedPromotion);

                    const discountedPrice = calculateItemDiscountedPrice(item);
                    const itemTotal = item.price * item.quantity;
                    const discountedTotal = discountedPrice * item.quantity;

                    return (
                        <div key={item.id} className="az-summary-item">

                            {/* IMAGE */}
                            <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="az-summary-img"
                            />

                            {/* INFO */}
                            <div className="az-summary-info">
                                <div className="az-summary-name">
                                    {item.product.name}
                                </div>

                                <div className="az-summary-text">
                                    Đơn giá: {item.price.toLocaleString('vi-VN')}₫
                                </div>

                                <div className="az-summary-text">
                                    Số lượng: {item.quantity}
                                </div>

                                {/* TOTAL */}
                                {isDiscounted ? (
                                    <div className="az-summary-total">
                                        <HiOutlineReceiptPercent className="me-1" />
                                        Tổng:
                                        <span className="old">
                                            {itemTotal.toLocaleString('vi-VN')}₫
                                        </span>
                                        <span className="new">
                                            {discountedTotal.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                ) : (
                                    <div className="az-summary-total">
                                        <HiOutlineShoppingCart className="me-1" />
                                        Tổng: {itemTotal.toLocaleString('vi-VN')}₫
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* FOOTER */}
            <div className="az-summary-footer">
                <hr />

                <div className="az-summary-final">
                    <HiOutlineShoppingCart className="me-1" />
                    Tổng cộng:
                    <span>
                        {calculateTotal().toLocaleString('vi-VN')}₫
                    </span>
                </div>

                {selectedPromotion && (
                    <p className="az-summary-promo">
                         <HiOutlineTag className="me-1" />
                        Mã giảm giá: <strong>{selectedPromotion.code}</strong>
                    </p>
                )}
            </div>

        </div>
    );
};

export default CartSummary;