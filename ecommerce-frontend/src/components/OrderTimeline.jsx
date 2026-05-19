import React from "react";
import {
  FaCheckCircle,
  FaShippingFast,
  FaBoxOpen,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileInvoiceDollar
} from "react-icons/fa";

import "../styles/orderTimeline.css";

const steps = [
  { key: "PENDING", label: "Chờ xác nhận", icon: FaHourglassHalf },
  { key: "PAID", label: "Đã thanh toán", icon: FaFileInvoiceDollar }, // Thay icon cho hợp lý hơn
  { key: "SHIPPED", label: "Đang giao hàng", icon: FaShippingFast },
  { key: "COMPLETED", label: "Hoàn thành", icon: FaBoxOpen }
];

const finalStates = {
  CANCELLED: { label: "Đơn hàng đã hủy", subLabel: "Đơn hàng đã được hủy theo yêu cầu của bạn hoặc hệ thống.", icon: FaTimesCircle, type: "cancelled" },
  FAILED: { label: "Giao hàng thất bại", subLabel: "Rất tiếc, việc giao hàng đã không thành công. Vui lòng liên hệ hỗ trợ.", icon: FaTimesCircle, type: "failed" }
};

const OrderTimeline = ({ status }) => {
  // Xử lý trạng thái kết thúc đặc biệt (Hủy / Thất bại)
  if (finalStates[status]) {
    const state = finalStates[status];
    const FinalIcon = state.icon;

    return (
      <div className="az-timeline-container">
        <div className={`az-timeline-final-card ${state.type}`}>
          <div className="az-final-icon-wrapper">
            <FinalIcon />
          </div>
          <div className="az-final-content">
            <h3>{state.label}</h3>
            <p>{state.subLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="az-timeline-container">
      <div className="az-timeline">
        {steps.map((step, index) => {
          const Icon = step.icon;
          
          // Phân loại trạng thái chính xác để CSS
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const statusClass = isCompleted ? "completed" : isActive ? "active" : "upcoming";

          return (
            <div key={step.key} className={`az-timeline-step ${statusClass}`}>
              {/* Vòng tròn chứa Icon */}
              <div className="az-timeline-icon-box">
                <Icon />
                {isCompleted && <span className="az-check-badge">✓</span>}
              </div>

              {/* Nhãn trạng thái */}
              <div className="az-timeline-label">
                {step.label}
              </div>

              {/* Đường nối giữa các bước */}
              {index !== steps.length - 1 && (
                <div className={`az-timeline-line ${isCompleted ? "completed" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;