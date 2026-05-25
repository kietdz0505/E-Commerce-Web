import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/axiosInstance";
import { getApiUrl } from "../../config/apiConfig";
import OrderTimeline from "../../components/OrderTimeline";

import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle
} from "react-icons/hi2";

import {
  FaBoxOpen,
  FaMoneyBillWave,
  FaTag
} from "react-icons/fa";

import "../../styles/orderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(getApiUrl("GET_ORDER_BY_ID", id));
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await apiClient.put(
        getApiUrl("UPDATE_ORDER_INFO", id),
        order
      );
      setOrder(res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="az-loading">Đang tải...</div>;

  // ===== LOCK EDIT STATUS =====
  const isLocked = [
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
    "FAILED"
  ].includes(order.status);

  const getStatus = () => {
    switch (order.status) {
      case "PENDING":
        return <span className="status pending">Chờ xử lý</span>;
      case "PAID":
        return <span className="status paid">Đã thanh toán</span>;
      case "SHIPPED":
        return <span className="status shipping">Đang giao</span>;
      case "COMPLETED":
        return <span className="status success">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="status cancel">Đã hủy</span>;
      case "FAILED":
        return <span className="status failed">Thất bại</span>;
      default:
        return <span className="status">{order.status}</span>;
    }
  };

  return (
    <div className="az-order-detail">

      {/* HEADER */}
      <div className="az-order-header">
        <div className="az-order-header-content">
          <h2>
            <FaBoxOpen /> Chi tiết đơn hàng #{order.id}
          </h2>
          {getStatus()}
        </div>
      </div>
      <div className="az-order-timeline-box">
        <OrderTimeline status={order.status} />
      </div>

      {/* WARNING */}
      {isLocked && (
        <div className="az-order-warning">
          Đơn hàng đã xử lý, không thể chỉnh sửa thông tin.
        </div>
      )}

      {/* INFO */}
      <div className="az-order-card">

        <div className="az-form-row">
          <label><HiOutlineUser /> Người nhận</label>
          <input
            value={order.receiverName || ""}
            onChange={(e) =>
              setOrder({ ...order, receiverName: e.target.value })
            }
            disabled={!editMode || isLocked}
          />
        </div>

        <div className="az-form-row">
          <label><HiOutlinePhone /> Số điện thoại</label>
          <input
            value={order.receiverPhone || ""}
            onChange={(e) =>
              setOrder({ ...order, receiverPhone: e.target.value })
            }
            disabled={!editMode || isLocked}
          />
        </div>

        <div className="az-form-row">
          <label><HiOutlineMapPin /> Địa chỉ</label>
          <input
            value={order.deliveryAddress || ""}
            onChange={(e) =>
              setOrder({ ...order, deliveryAddress: e.target.value })
            }
            disabled={!editMode || isLocked}
          />
        </div>

        {/* META */}
        <div className="az-meta">
          <div><HiOutlineCreditCard /> {order.paymentMethod}</div>
          <div>
            <HiOutlineCalendarDays />
            {new Date(order.orderDate).toLocaleString("vi-VN")}
          </div>
          <div>
            <FaMoneyBillWave />
            <strong>
              {Number(order.totalAmount).toLocaleString("vi-VN")}₫
            </strong>
          </div>
          <div><FaTag /> {order.promotionCode || "Không có mã"}</div>
        </div>

        {/* BUTTON */}
        {!isLocked && (
          <button
            className={`az-btn ${editMode ? "save" : "edit"}`}
            onClick={
              editMode ? handleSave : () => setEditMode(true)
            }
            disabled={loading}
          >
            {loading ? (
              "Đang lưu..."
            ) : editMode ? (
              <>
                <HiOutlineCheckCircle /> Lưu
              </>
            ) : (
              <>
                <HiOutlinePencilSquare /> Chỉnh sửa
              </>
            )}
          </button>
        )}

      </div>

      {/* TABLE */}
      <div className="az-order-table-container">
        <h4 className="az-table-title">
          <FaBoxOpen /> <span>Sản phẩm trong đơn</span>
        </h4>

        <div className="az-table-responsive-wrapper">
          <table className="az-modern-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="text-center">Số lượng</th>
                <th className="text-right">Giá gốc</th>
                <th className="text-right">Giá KM</th>
                <th className="text-right">Thành tiền</th>
              </tr>
            </thead>

            <tbody>
              {order.items?.map((item, i) => {
                const hasDiscount = item.discountedUnitPrice < item.unitPrice;

                return (
                  <tr key={i}>
                    {/* Cột sản phẩm chứa ảnh và tên */}
                    <td className="az-col-product">
                      <div className="az-product-thumb">
                        <img
                          src={item.productImage || "https://placehold.co/60x60?text=No+Image"}
                          alt={item.productName}
                          onError={(e) => { e.target.src = "https://placehold.co/60x60?text=No+Image" }}
                        />
                      </div>
                      <div className="az-product-info">
                        <span className="az-product-name">{item.productName}</span>
                        <span className="az-product-sku">Mã SP: #{item.productId || i}</span>
                      </div>
                    </td>

                    {/* Cột Số lượng */}
                    <td className="text-center az-col-qty" data-label="Số lượng:">
                      <span className="az-badge-qty">x{item.quantity}</span>
                    </td>

                    {/* Cột Giá gốc */}
                    <td className="text-right az-col-original-price" data-label="Giá gốc:">
                      <span className={`az-price-original ${hasDiscount ? "strikethrough" : ""}`}>
                        {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                      </span>
                    </td>

                    {/* Cột Giá KM */}
                    <td className="text-right az-col-discount-price" data-label="Giá sau khi giảm:">
                      <span className="az-price-discount">
                        {Number(item.discountedUnitPrice).toLocaleString("vi-VN")}₫
                      </span>
                    </td>

                    {/* Cột Thành tiền */}
                    <td className="text-right az-col-total" data-label="Thành tiền:">
                      <span className="az-price-total">
                        {(item.discountedUnitPrice * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OrderDetail;