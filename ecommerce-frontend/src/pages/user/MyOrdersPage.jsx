import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    useNavigate,
    useSearchParams
} from 'react-router-dom';

import toast from 'react-hot-toast';

import {
    HiOutlineShoppingBag,
    HiOutlineChevronLeft,
    HiOutlineChevronRight
} from "react-icons/hi2";

import {
    getMyOrders
} from '../../services/user/orderService';

import OrderCard from '../../components/OrderCard';

import '../../styles/myOrdersPage.css';

const MyOrdersPage = () => {

    const [ordersData, setOrdersData] =
        useState(null);

    const [page, setPage] =
        useState(0);

    const [error, setError] =
        useState(null);

    const [searchParams] =
        useSearchParams();

    const navigate =
        useNavigate();

    // FIX DOUBLE TOAST
    const handledPayment =
        useRef(false);

    // =========================================================
    // PAGE TITLE
    // =========================================================

    useEffect(() => {

        document.title =
            "Đơn hàng của tôi";

    }, []);

    // =========================================================
    // PAYMENT RESULT
    // =========================================================

    useEffect(() => {

        // React StrictMode fix
        if (handledPayment.current) {
            return;
        }

        const payment =
            searchParams.get("payment");

        // không có query
        if (!payment) {
            return;
        }

        handledPayment.current = true;

        if (payment === "success") {

            toast.success(
                "Thanh toán thành công"
            );

        } else if (
            payment === "failed"
        ) {

            toast.error(
                "Thanh toán thất bại"
            );
        }

        // remove query param
        setTimeout(() => {

            navigate(
                "/my-orders",
                {
                    replace: true
                }
            );

        }, 100);

    }, [navigate, searchParams]);

    // =========================================================
    // FETCH ORDERS
    // =========================================================

    useEffect(() => {

        fetchOrders(page);

    }, [page]);

    const fetchOrders = async (
        pageNumber
    ) => {

        try {

            const data =
                await getMyOrders(
                    pageNumber
                );

            data.content.sort(
                (a, b) =>
                    new Date(
                        b.orderDate
                    ) -
                    new Date(
                        a.orderDate
                    )
            );

            setOrdersData(data);

            setError(null);

        } catch (err) {

            console.error(
                "FETCH ORDERS ERROR",
                err
            );

            setError(
                "Không thể tải danh sách đơn hàng"
            );

            toast.error(
                "Không thể tải danh sách đơn hàng"
            );
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (error) {

        return (
            <div className="az-error">
                {error}
            </div>
        );
    }

    if (!ordersData) {

        return (
            <div className="az-loading">
                Đang tải...
            </div>
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="az-orders-container">

            {/* HEADER */}
            <div className="az-orders-header">

                <HiOutlineShoppingBag />

                <h2>
                    Đơn hàng của tôi
                </h2>

            </div>

            {/* ORDER LIST */}
            <div className="az-orders-list">

                {ordersData.content.map(
                    (order) => (

                        <OrderCard
                            key={order.id}
                            order={order}
                            onCancelSuccess={() =>
                                fetchOrders(page)
                            }
                        />
                    )
                )}

            </div>

            {/* PAGINATION */}
            <div className="az-pagination">

                <button
                    onClick={() =>
                        setPage(
                            (p) => p - 1
                        )
                    }
                    disabled={
                        ordersData.first
                    }
                >

                    <HiOutlineChevronLeft />

                    Trang trước

                </button>

                <span>
                    Trang {page + 1}
                </span>

                <button
                    onClick={() =>
                        setPage(
                            (p) => p + 1
                        )
                    }
                    disabled={
                        ordersData.last
                    }
                >

                    Trang sau

                    <HiOutlineChevronRight />

                </button>

            </div>

        </div>
    );
};

export default MyOrdersPage;