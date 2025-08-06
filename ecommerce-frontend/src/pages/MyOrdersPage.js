import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../services/OrderService';
import OrderCard from '../components/OrderCard';

const MyOrdersPage = () => {
    const [ordersData, setOrdersData] = useState(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const fetchOrders = async (pageNumber) => {
        const data = await getMyOrders(pageNumber);
        data.content.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));  // Sắp xếp mới nhất lên đầu
        setOrdersData(data);
    };

    const handleNextPage = () => {
        if (ordersData && !ordersData.last) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (ordersData && !ordersData.first) {
            setPage(page - 1);
        }
    };

    if (!ordersData) return <div>Loading...</div>;

    return (
        <div className="container my-5">
            <h2 className="mb-4">Đơn hàng của tôi</h2>

            {ordersData.content.map(order => (
                <OrderCard key={order.id} order={order} />
            ))}

            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-secondary" onClick={handlePrevPage} disabled={ordersData.first}>
                    Trang trước
                </button>
                <button className="btn btn-secondary" onClick={handleNextPage} disabled={ordersData.last}>
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default MyOrdersPage;
