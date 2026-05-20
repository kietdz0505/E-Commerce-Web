package com.example.ecommerce_web.model;

public enum PaymentStatus {
    PENDING,      // đang tạo giao dịch
    SUCCESS,      // thanh toán thành công
    FAILED,       // thất bại
    CANCELLED,    // user hủy
    REFUNDED      // hoàn tiền
}