import React from 'react';
import { cancelOrder } from '../services/user/orderService';
import { getApiUrl } from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

import {
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineTag,
  HiOutlineEye
} from "react-icons/hi2";

import { FaBoxOpen, FaTimesCircle } from "react-icons/fa";

import '../styles/orderCard.css';

const OrderCard = ({ order, onCancelSuccess }) => {
    const navigate = useNavigate();

    const handleCancel = async () => {
        if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            try {
                const message = await cancelOrder(order.id);
                alert(message);
                onCancelSuccess();
            } catch (error) {
                alert(error.message || 'Có lỗi xảy ra');
            }
        }
    };

    // ===== STATUS STYLE =====
    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'pending';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'cancel';
            case 'SHIPPED':
                return 'shipped';
            case 'PAID':
                return 'paid';
            case 'FAILED':
                return 'failed';
            default:
                return '';
        }
    };

    return (
        <div className="az-order-card">

            {/* HEADER */}
            <div className="az-order-header">
                <div className="left">
                    <FaBoxOpen />
                    Đơn hàng #{order.id}
                </div>

                <div className={`status ${getStatusClass(order.status)}`}>
                    {order.status}
                </div>
            </div>

            {/* INFO */}
            <div className="az-order-info">
                <div>
                    <HiOutlineClock /> {new Date(order.orderDate).toLocaleString()}
                </div>

                <div>
                    <HiOutlineCreditCard /> {order.paymentMethod || 'Chưa rõ'}
                </div>

                <div>
                    <HiOutlineTag /> {order.promotionCode || 'Không có mã'}
                </div>
            </div>

            {/* TOTAL */}
            <div className="az-order-total">
                Tổng tiền:
                <span>
                    {order.totalAmount
                        ? order.totalAmount.toLocaleString('vi-VN') + '₫'
                        : 'Đang tính...'}
                </span>
            </div>

            {/* ITEMS */}
            <div className="az-order-items">
                {(order.items || []).map((item, index) => (
                    <div key={index} className="item">
                        <div className="name">{item.productName}</div>
                        <div className="meta">
                            x{item.quantity} • {item.unitPrice.toLocaleString('vi-VN')}₫
                        </div>
                    </div>
                ))}
            </div>

            {/* ACTION */}
            <div className="az-order-actions">
                <button
                    className="btn cancel"
                    onClick={handleCancel}
                    disabled={!order.cancelable}
                >
                    <FaTimesCircle />
                    Hủy
                </button>

                <button
                    className="btn view"
                    onClick={() => navigate(`/order/${order.id}`)}
                >
                    <HiOutlineEye />
                    Chi tiết
                </button>
            </div>

        </div>
    );
};

export default OrderCard;