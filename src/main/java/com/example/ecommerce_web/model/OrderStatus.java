package com.example.ecommerce_web.model;

public enum OrderStatus {
    PENDING,    // Chờ xác nhận
    PAID,       // Đã thanh toán
    SHIPPED,    // Đang giao
    COMPLETED,  // Đã giao thành công
    CANCELED ,   // Đã hủy
    FAILED
}
