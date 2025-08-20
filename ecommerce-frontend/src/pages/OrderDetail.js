import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import { getApiUrl } from "../config/apiConfig";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false); // 🔥 thêm loading

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(getApiUrl("GET_ORDER_BY_ID", id));
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      }
    };
    fetchOrder();
  }, [id]);

  const handleSave = async () => {
    setLoading(true); // 🔥 bắt đầu loading
    try {
      const payload = {
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        promotionCode: order.promotionCode,
        items: order.items?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountedUnitPrice: item.discountedUnitPrice,
        })),
      };

      const res = await apiClient.put(getApiUrl("UPDATE_ORDER_INFO", id), payload);
      setOrder(res.data);
      setEditMode(false);
      alert("✅ Cập nhật đơn hàng thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật đơn hàng:", err);
      alert("❌ Không thể cập nhật đơn hàng");
    } finally {
      setLoading(false); // 🔥 kết thúc loading
    }
  };

  if (!order) return <p className="text-center mt-5">⏳ Đang tải đơn hàng...</p>;

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
      case "COMPLETED":
        return <span className="badge bg-success">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="mb-3">🛒 Đơn hàng #{order.id}</h3>

        {/* Thông tin đơn hàng */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Tên người nhận</label>
            <input
              type="text"
              className="form-control"
              value={order.receiverName || ""}
              onChange={(e) => setOrder({ ...order, receiverName: e.target.value })}
              disabled={!editMode}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              value={order.receiverPhone || ""}
              onChange={(e) => setOrder({ ...order, receiverPhone: e.target.value })}
              disabled={!editMode}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Địa chỉ giao hàng</label>
          <input
            type="text"
            className="form-control"
            value={order.deliveryAddress || ""}
            onChange={(e) => setOrder({ ...order, deliveryAddress: e.target.value })}
            disabled={!editMode}
          />
        </div>

        <div className="mt-3">
          <p>
            <strong>Phương thức thanh toán:</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Trạng thái:</strong> {getStatusBadge(order.status)}
          </p>
          <p>
            <strong>Ngày đặt:</strong>{" "}
            {new Date(order.orderDate).toLocaleString("vi-VN")}
          </p>
          <p>
            <strong>Mã khuyến mãi:</strong>{" "}
            <span className="text-primary">
              {order.promotionCode || "Không có"}
            </span>
          </p>
          <h4 className="text-success fw-bold">
            Tổng tiền:{" "}
            {order.totalAmount !== undefined
              ? Number(order.totalAmount).toLocaleString("vi-VN") + " VND"
              : "0 VND"}
          </h4>
        </div>

        <div className="mt-4">
          {editMode ? (
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={loading} // 🔥 khóa nút khi loading
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Đang lưu...
                </>
              ) : (
                "💾 Lưu thay đổi"
              )}
            </button>
          ) : (
            <button className="btn btn-warning" onClick={() => setEditMode(true)} disabled={order.status !== "PENDING"}>
              ✏️ Chỉnh sửa đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="card shadow p-4 mt-4">
        <h5>📦 Sản phẩm trong đơn hàng</h5>
        <table className="table table-hover mt-3 align-middle">
          <thead className="table-light">
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá gốc</th>
              <th>Đơn giá sau giảm</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => {
              const unitPrice = Number(item.unitPrice || 0);
              const discountedPrice = Number(item.discountedUnitPrice || 0);
              return (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{unitPrice.toLocaleString("vi-VN")} VND</td>
                  <td>{discountedPrice.toLocaleString("vi-VN")} VND</td>
                  <td className="fw-bold text-end text-success">
                    {(discountedPrice * item.quantity).toLocaleString("vi-VN")} VND
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;
