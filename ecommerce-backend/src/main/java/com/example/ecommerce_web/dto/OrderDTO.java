package com.example.ecommerce_web.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private String status;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
}
