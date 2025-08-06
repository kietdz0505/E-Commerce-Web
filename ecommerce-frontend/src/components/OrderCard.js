import React from 'react';

const OrderCard = ({ order }) => {
    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between">
                <div>Đơn hàng #{order.id}</div>
                <div>Trạng thái: <span className="fw-bold">{order.status}</span></div>
            </div>
            <div className="card-body">
                <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
                <p><strong>Mã khuyến mãi:</strong> {order.promotionCode || 'Không'}</p>
                <p><strong>Tổng tiền:</strong> {order.totalAmount || 'Đang tính toán...'} VNĐ</p>

                <p><strong>Sản phẩm:</strong></p>
                <ul>
                    {order.items.map((item, index) => (
                        <li key={index}>
                            {item.productName} - SL: {item.quantity} - Giá: {item.unitPrice} VNĐ
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrderCard;
