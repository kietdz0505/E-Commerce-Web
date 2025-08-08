import React from 'react';
import { cancelOrder } from '../services/OrderService';
import { getApiUrl } from '../config/apiConfig';

const OrderCard = ({ order, onCancelSuccess }) => {
    const handleCancel = async () => {
    console.log("Hủy đơn:", order.id);
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        try {
            console.log("Gửi yêu cầu hủy đến:", getApiUrl('CANCEL_ORDER', order.id));
            const message = await cancelOrder(order.id);
            console.log("Phản hồi từ server:", message);
            alert(message);
            onCancelSuccess();
        } catch (error) {
            console.error("Lỗi:", error);
            alert(error.message || 'Có lỗi xảy ra');
        }
    }
};

    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between">
                <div>Đơn hàng #{order.id}</div>
                <div>Trạng thái: <span className="fw-bold">{order.status}</span></div>
            </div>
            <div className="card-body">
                <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod || 'Chưa rõ'}</p>
                <p><strong>Mã khuyến mãi:</strong> {order.promotionCode || 'Không'}</p>
                <p><strong>Tổng tiền:</strong> {order.totalAmount ? `${order.totalAmount} VNĐ` : 'Đang tính toán...'}</p>

                <p><strong>Sản phẩm:</strong></p>
                <ul>
                    {(order.items || []).map((item, index) => (
                        <li key={index}>
                            {item.productName} - SL: {item.quantity} - Giá: {item.unitPrice} VNĐ
                        </li>
                    ))}
                </ul>

                <button
                    className="btn btn-danger mt-3"
                    onClick={handleCancel}
                    disabled={!order.cancelable}
                >
                    Hủy đơn hàng
                </button>
            </div>
        </div>
    );
};

export default OrderCard;