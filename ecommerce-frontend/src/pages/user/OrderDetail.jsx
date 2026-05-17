import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/axiosInstance";
import { getApiUrl } from "../../config/apiConfig";

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
      const res = await apiClient.put(getApiUrl("UPDATE_ORDER_INFO", id), order);
      setOrder(res.data);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="az-loading">Đang tải...</div>;

  const getStatus = () => {
    switch (order.status) {
      case "PENDING":
        return <span className="status pending">Chờ xử lý</span>;
      case "COMPLETED":
        return <span className="status success">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="status cancel">Đã hủy</span>;
      default:
        return <span className="status">{order.status}</span>;
    }
  };

  return (
    <div className="az-order-detail">

      {/* HEADER */}
      <div className="az-order-header">
        <div className="az-order-header-content">
            <h2><FaBoxOpen /> Chi tiết đơn hàng #{order.id}</h2>
            {getStatus()}
          </div>


      </div>

      {/* INFO */}
      <div className="az-order-card">

        <div className="az-form-row">
          <label><HiOutlineUser /> Người nhận</label>
          <input
            value={order.receiverName || ""}
            onChange={e => setOrder({ ...order, receiverName: e.target.value })}
            disabled={!editMode}
          />
        </div>

        <div className="az-form-row">
          <label><HiOutlinePhone /> Số điện thoại</label>
          <input
            value={order.receiverPhone || ""}
            onChange={e => setOrder({ ...order, receiverPhone: e.target.value })}
            disabled={!editMode}
          />
        </div>

        <div className="az-form-row">
          <label><HiOutlineMapPin /> Địa chỉ</label>
          <input
            value={order.deliveryAddress || ""}
            onChange={e => setOrder({ ...order, deliveryAddress: e.target.value })}
            disabled={!editMode}
          />
        </div>

        {/* META */}
        <div className="az-meta">
          <div><HiOutlineCreditCard /> {order.paymentMethod}</div>
          <div><HiOutlineCalendarDays /> {new Date(order.orderDate).toLocaleString("vi-VN")}</div>
          <div><FaMoneyBillWave /> <strong>{Number(order.totalAmount).toLocaleString("vi-VN")}₫</strong></div>
          <div><FaTag /> {order.promotionCode || "Không có mã"}</div>
        </div>

        {/* BUTTON */}
        <button
          className={`az-btn ${editMode ? "save" : "edit"}`}
          onClick={editMode ? handleSave : () => setEditMode(true)}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : editMode ? (
            <>
              <HiOutlineCheckCircle /> Lưu
            </>
          ) : (
            <>
              <HiOutlinePencilSquare /> Chỉnh sửa
            </>
          )}
        </button>

      </div>

      {/* TABLE */}
      <div className="az-order-table">
        <h4><FaBoxOpen /> Sản phẩm trong đơn</h4>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Giá gốc</th>
              <th>Giá KM</th>
              <th>Thành tiền</th>
            </tr>
          </thead>

          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td className="name">{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.unitPrice).toLocaleString("vi-VN")}₫</td>
                <td className="discount">{Number(item.discountedUnitPrice).toLocaleString("vi-VN")}₫</td>
                <td className="total">
                  {(item.discountedUnitPrice * item.quantity).toLocaleString("vi-VN")}₫
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default OrderDetail;