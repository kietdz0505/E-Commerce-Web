import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../services/OrderService';
import OrderCard from '../components/OrderCard';

const MyOrdersPage = () => {
    const [ordersData, setOrdersData] = useState(null);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const fetchOrders = async (pageNumber) => {
        try {
            const data = await getMyOrders(pageNumber);
            data.content.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Mới nhất lên đầu
            setOrdersData(data);
            setError(null);
        } catch (error) {
            console.error('Lỗi khi lấy đơn hàng:', error);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại!');
        }
    };

    const handleNextPage = () => {
        if (ordersData && !ordersData.last) {
            setPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (ordersData && !ordersData.first) {
            setPage(prev => prev - 1);
        }
    };

    if (error) return <div className="container my-5 text-danger">{error}</div>;
    if (!ordersData) return <div className="container my-5">Đang tải...</div>;

    return (
        <div className="container my-5">
            <h2 className="mb-4">Đơn hàng của tôi</h2>

            {ordersData.content.map(order => (
                <OrderCard 
                    key={order.id} 
                    order={order} 
                    onCancelSuccess={() => fetchOrders(page)} 
                />
            ))}

            <div className="d-flex justify-content-between mt-4">
                <button 
                    className="btn btn-secondary" 
                    onClick={handlePrevPage} 
                    disabled={ordersData.first}
                >
                    Trang trước
                </button>
                <button 
                    className="btn btn-secondary" 
                    onClick={handleNextPage} 
                    disabled={ordersData.last}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default MyOrdersPage;